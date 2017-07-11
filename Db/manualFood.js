var mongoose = require('mongoose');
var wagner = require('wagner-core');
var express = require('express');
var status = require('http-status');
var superagent = require('superagent');
var http = require('http');


var db = 'mongodb://localhost:27017/app';

var models = require('./client/js/server/models/models.js')(wagner, db);

var app = express();
       
// set up models and wagner factories, connect to mongodb
var User, Food, FoodEaten, Diary;
User = models.User;
Food = models.Food;
FoodEaten = models.FoodEaten;
Diary = models.Diary;

var addFoods = [
  { _id: 'Lamb',
  serving: {
    amount: 100,
    unit: 'g',
  },
  nutrition: {
    calories: 294 
  },
  impact: {
    waterPerCal: 4.25,
    carbonPerCal: 13.3
  }
  },
  { _id: 'Apple',
  serving: {
    amount: 182,
    unit: 'g',
  },
  nutrition: {
    calories: 95 
  },
  impact: {
    waterPerCal: 1.6,
    carbonPerCal: 2.1
  }
  },
  { _id: 'Banana',
  serving: {
    amount: 118,
    unit: 'g',
  },
  nutrition: {
    calories: 105 
  },
  impact: {
    waterPerCal: 0.9,
    carbonPerCal: 1.24
  }
  },
  { _id: 'Bread',
  serving: {
    amount: 30,
    unit: 'g',
  },
  nutrition: {
    calories: 79.8
  },
  impact: {
    waterPerCal: 0.60,
    carbonPerCal: 0.47
  }
  },
  { _id: 'Chicken Breast',
  serving: {
    amount: 100,
    unit: 'g',
  },
  nutrition: {
    calories: 165
  },
  impact: {
    waterPerCal: 3,
    carbonPerCal: 4.18
  }
  },
  { _id: 'Rice',
  serving: {
    amount: 100,
    unit: 'g',
  },
  nutrition: {
    calories: 130 
  },
  impact: {
    waterPerCal: 1.92,
    carbonPerCal: 2.07
  }
  },
  { _id: 'Cabbage',
  serving: {
    amount: 23,
    unit: 'g',
  },
  nutrition: {
    calories: 6
  },
  impact: {
    waterPerCal: 1.07,
    carbonPerCal: 7.67
  }
  },
  { _id: 'Cheddar Cheese',
  serving: {
    amount: 1,
    unit: 'oz',
  },
  nutrition: {
    calories: 113
  },
  impact: {
    waterPerCal: 0.79,
    carbonPerCal: 3.35
  }
  },
  { _id: 'Egg',
  serving: {
    amount: 50,
    unit: 'g',
  },
  nutrition: {
    calories: 78
  },
  impact: {
    waterPerCal: 2.1,
    carbonPerCal: 3.08
  }
  },
  { _id: 'Peanuts',
  serving: {
    amount: 146,
    unit: 'g',
  },
  nutrition: {
    calories: 828
  },
  impact: {
    waterPerCal: 0.49,
    carbonPerCal: 0.41
  }
  },
  { _id: 'Lettuce',
  serving: {
    amount: 36,
    unit: 'g',
  },
  nutrition: {
    calories: 5 
  },
  impact: {
    waterPerCal: 1.71,
    carbonPerCal: 14.4
  }
  },
  { _id: 'Corn',
  serving: {
    amount: 166,
    unit: 'g',
  },
  nutrition: {
    calories: 606
  },
  impact: {
    waterPerCal: 0.33,
    carbonPerCal: 0.55
  }
  },
  { _id: 'Whole Milk',
  serving: {
    amount: 1,
    unit: 'cup',
  },
  nutrition: {
    calories: 148 
  },
  impact: {
    waterPerCal: 1.63,
    carbonPerCal: 4.5
  }
  },
  { _id: 'Pork Tenderloin',
  serving: {
    amount: 100,
    unit: 'g',
  },
  nutrition: {
    calories: 120
  },
  impact: {
    waterPerCal: 4.99,
    carbonPerCal: 10.01
  }
  },
  { _id: 'Potato',
  serving: {
    amount: 213,
    unit: 'g',
  },
  nutrition: {
    calories: 163
  },
  impact: {
    waterPerCal: 0.38,
    carbonPerCal: 3.79
  }
  },
  { _id: 'Pasta',
  serving: {
    amount: 105,
    unit: 'g',
  },
  nutrition: {
    calories: 390 
  },
  impact: {
    waterPerCal: 0.5,
    carbonPerCal: 0.48
  }
  }
  ];

Food.insertMany(addFoods, function(err, docs) {
  if (err) {
    return console.log(err);
  }
  
  console.log(docs);
});

// { _id: ,
// serving: {
//   amount: ,
//   unit: ,
// },
// nutrition: {
//   calories: 
// },
// impact: {
//   waterPerCal: ,
//   carbonPerCal:
// }
// },

// FoodEaten.remove({}, function(err) {
//   if (err) {
//       return console.log(err);
//   }
// });
// Diary.remove({}, function(err) {
//   if (err) {
//       return console.log(err);
//   }
// });
// Food.remove({_id: 'test beef'}, function(err) {
//   if (err) {
//       return console.log(err);
//   }
// });

// var beef = new Food({
//             _id: 'Beef',
//             serving: {
//                 amount: 100,
//                 unit: 'g'
//             },
//             nutrition: {
//                 calories: 250
//             },
//             impact: {
//                 waterPerCal: 10.19,
//                 carbonPerCal: 15.68
//             }
//         });
        
// beef.save(function(err, beef) {
//   if (err) {
//       return console.log(err);
//   } 
//   console.log(beef);
// });

// var URL_ROOT = 'http://react-tutorial.hansonyu.c9users.io:8082'        

// app.use('/api', require('./client/js/server/api.js')(wagner));

// var server;        
// server = http.createServer(app);
// server.listen('8082' || 3000, process.env.IP || "0.0.0.0", function() {
//     console.log('listening on: ' + URL_ROOT);
// });

// var superagentSession = superagent.agent();
// var url = URL_ROOT + '/api/login';
// var correctPass = { username: 'testing123', password: 'password123' };

// superagentSession.get(url).query(correctPass).end(function(err, res) {
//     if (err) {
//         return console.log(err);
//     }
     
//          // create new food eaten and add to diary entry
//          var beefEaten = {
//              foodEaten: {
//             item: 'Beef',
//             serving: {
//                 amount: 4,
//                 unit: 'oz'
//             }
//              },
//              date: new Date()
         
//          };
//         url = URL_ROOT + '/api/me/diary';
//         superagentSession.put(url).send(beefEaten).end(function(err, res) {
//             if (err) {
//                 return console.log(err);
//             }
//           var response = JSON.parse(res.text).diary;
//           console.log(response);
//         });
// });