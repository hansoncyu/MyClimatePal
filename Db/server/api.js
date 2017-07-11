var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var login = require('./login.js');

module.exports = function(wagner) {
    var api = express.Router();
    api.use(bodyparser.json());

    // bootstrap login api
    wagner.invoke(function(User) {
       login(User, api);
    });

    // creates new ref food
    api.put('/me/newfood', wagner.invoke(function(Food) {
        return function(req, res) {
            if (!req.user) {
                return res.status(status.UNAUTHORIZED).json({ error: 'Not logged in' });
            }
            try {
                var food = req.body;
            } catch(e) {
                return res.status(status.BAD_REQUEST).json({ error: 'No food specified!' });
            }
            food = new Food(food);
            food.save(function(err, food) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                }
                return res.json({ food: food });
            });
        };
    }));

    // create foodEaten and update diary entry with it
    api.put('/me/diary', wagner.invoke(function(Diary, FoodEaten) {
        return function(req, res) {
            if (!req.user) {
                return res.status(status.UNAUTHORIZED).json({ error: 'Not logged in' });
            }
            try {
                var userID = req.user._id;
                var foodEaten = req.body.foodEaten;
                var date = req.body.date;
            } catch(e) {
                return res.status(status.BAD_REQUEST).json({ error: 'No food specified!' });
            }

            foodEaten = new FoodEaten(foodEaten);
            foodEaten.save(function(err, foodEaten) {
               if (err) {
                   return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
               }
               foodEaten.calculateInfo(FoodEaten, function(err, foodEaten) {
                  if (err) {
                      return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                  }
                  // build query to find diary for the day
                  var foodEatenID = foodEaten._id;
                  date = new Date(date);
                  var year = date.getFullYear();
                  var month = date.getMonth();
                  var day = date.getDate();
                  var query = {
                     createdBy: userID,
                     date: { "$gte": new Date(year, month, day), "$lt": new Date(year, month, day + 1) }
                  };
                  var foodCal = foodEaten.nutrition.calories;
                 var foodWater = foodEaten.impact.waterTotal;
                 var foodCarbon = foodEaten.impact.carbonTotal;
                 var diaryEntry = {
                     date: date,
                     $push: { food: foodEatenID },
                     $inc: {
                         'nutrition.caloriesTotal': foodCal,
                         'impact.waterTotal': foodWater,
                         'impact.carbonTotal': foodCarbon
                     }
                 };
                  Diary.findOneAndUpdate(query, diaryEntry, { upsert: true, new: true, runValidators: true }).populate('food').exec(function(err, diary) {
                      if (err) {
                          return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                      }
                      return res.json({ diary: diary });
                  });
               });
            });
        };
    }));


    // view diary for specified date
    api.get('/me', wagner.invoke(function(Diary) {
        return function(req, res) {
            if (!req.user) {
                return res.status(status.UNAUTHORIZED).json({ error: 'Not logged in' });
            }

            try {
                var date = req.query.date;
                var userID = req.user._id;
            } catch(e) {
                return res.status(status.BAD_REQUEST).json({ error: 'No date specified!' });
            }
            date = new Date(date);
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var query = {
                createdBy: userID,
                date: { "$gte": new Date(year, month, day), "$lt": new Date(year, month, day + 1) }
            };
            Diary.findOne(query).populate('food').exec(function(err, diary) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                }
                if (!diary) {
                    return res.status(status.NOT_FOUND).json({ error: 'Not found' });
                }
                return res.json({ diary: diary });
            });
        };
    }));

    // delete diary entry
    api.delete('/me/remove', wagner.invoke(function(FoodEaten, Diary) {
        return function(req, res) {
            if (!req.user) {
                return res.status(status.UNAUTHORIZED).json({ error: 'Not logged in' });
            }

            try {
                var entryID = req.body.entry;
            } catch(e) {
                return res.status(status.BAD_REQUEST).json({ error: 'No food specified!' });
            }
            // find and remove foodEaten entry
            FoodEaten.findOneAndRemove({ _id: entryID }, function(err, entry) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                }

                var foodCal = entry.nutrition.calories;
                var foodWater = entry.impact.waterTotal;
                var foodCarbon = entry.impact.carbonTotal;

                // find diary document by searching for ID in food array
                var update = {
                    $pull: { food: entryID },
                    $inc: {
                         'nutrition.caloriesTotal': -foodCal,
                         'impact.waterTotal': -foodWater,
                         'impact.carbonTotal': -foodCarbon
                     }
                }
                Diary.findOneAndUpdate({ food: entryID }, update, { upsert: true, new: true, runValidators: true }).populate('food').exec(function(err, diary) {
                    if (err) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                    }
                    return res.json({ diary: diary });
                });
            });
        }
    }));

    // search for ref food to make new food eaten entry
    api.get('/search', wagner.invoke(function(Food) {
        return function(req, res) {
            try {
                var searchTerm = req.query.search;
            } catch(e) {
                return res.status(status.BAD_REQUEST).json({ error: 'No search term specified!' });
            }
            Food.find({ _id: { $regex: searchTerm, $options: 'i' } }, null, { sort: {'_id': 1} }, function(err, food) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                }
                if (!food) {
                    return res.status(status.NOT_FOUND).json({ error: 'Not found' });
                }
                return res.json({ food: food });
            });
        };
    }));

    // check req.body for state rendering on client side
    api.get('/check', function(req, res) {
       if (!req.user) {
           return res.status(status.UNAUTHORIZED).json({ error: 'Not logged in' });
       }
       return res.json({ user: req.user });
    });

    return api;
};
