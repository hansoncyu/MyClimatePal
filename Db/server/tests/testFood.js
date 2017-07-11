var mongoose = require('mongoose');
var wagner = require('wagner-core');
var assert = require('assert');

// set up models and wagner factories, connect to mongodb test database
var db = 'mongodb://localhost:27017/test'
var models = require('../models/models.js')(wagner, db);
var User = models.User;
var Food = models.Food;
var FoodEaten = models.FoodEaten;
var Diary = models.Diary;

// create new test user
var testUser = new User({
    username: 'testing123',
    password: 'Password123'
});

// create new ref foods
var beef = new Food({
    _id: 'Beef',
    serving: {
        amount: 100,
        unit: 'g'
    },
    nutrition: {
        calories: 250
    },
    impact: {
        waterPerCal: 10.19,
        carbonPerCal: 15.68
    }
});

var chicken = new Food({
   _id: 'Chicken Breast',
    serving: {
        amount: 100,
        unit: 'g'
    },
    nutrition: {
        calories: 165
    },
    impact: {
        waterPerCal: 3,
        carbonPerCal: 4.18
    }
});

var rice = new Food({
   _id: 'Rice',
    serving: {
        amount: 100,
        unit: 'g'
    },
    nutrition: {
        calories: 130
    },
    impact: {
        waterPerCal: 1.92,
        carbonPerCal: 2.07
    }
});

// create foods eaten by test user

var beefEaten = new FoodEaten({
    item: 'Beef',
    serving: {
        amount: 250,
        unit: 'g'
    }
});

var chickenEaten = new FoodEaten({
    item: 'Chicken Breast',
    serving: {
        amount: 4,
        unit: 'oz'
    }
});

var riceEaten = new FoodEaten({
    item: 'Rice',
    serving: {
        amount: 300,
        unit: 'g'
    }
});

describe('Food and Diary Database', function() {
   before(function(done) {
       // make sure database is clear before adding things
        User.remove({}, function(err) {
           assert.ifError(err);
       });
       Food.remove({}, function(err) {
           assert.ifError(err);
       });
       FoodEaten.remove({}, function(err) {
           assert.ifError(err);
       });
       Diary.remove({}, function(err) {
           assert.ifError(err);
       });
       
       // wait a little bit to give time to clear database first, then save ref food
       setTimeout(function(){
           beef.save(function(err) {
               assert.ifError(err);
           });
           chicken.save(function(err) {
               assert.ifError(err);
           });
           rice.save(function(err) {
               assert.ifError(err);
           });
           console.log('Ref food added!');
           
           // save new test user
           testUser.save(function(err, testUser) {
               assert.ifError(err);
               console.log('Test user added!');
               done();
           });
           
       }, 200);
   });
   
   after(function(done) {
       // make sure database is clear after test is done
        User.remove({}, function(err) {
           assert.ifError(err);
       });
       Food.remove({}, function(err) {
           assert.ifError(err);
       });
       FoodEaten.remove({}, function(err) {
           assert.ifError(err);
       });
       Diary.remove({}, function(err) {
           assert.ifError(err);
       });
       console.log('Database cleared!');
       done();
   });
   
   
   it('user can put in food eaten and nutrition/impact are calculated automatically', function(done) {
      User.findOne({ username: 'testing123' }, function(err, testUser) {
          assert.ifError(err);
          beefEaten.save(function(err, item) {
             assert.ifError(err);
             // calculateInfo is needed to set nutrition/impact info
             item.calculateInfo(FoodEaten, function(err, item) {
                assert.ifError(err);
                var beefCal = item.nutrition.calories;
                var beefWater = item.impact.waterTotal;
             
                // check for nutrition/impact calculations being done correctly
                assert.equal(beefCal, 625);
                assert.equal(beefWater, 6368.75);
             });
          });
          
          chickenEaten.save(function(err, chickenEaten) {
             assert.ifError(err);
             chickenEaten.calculateInfo(FoodEaten, function(err, chickenEaten) {
                 assert.ifError(err);
                 var chickenCal = chickenEaten.nutrition.calories;
                 var chickenWater = chickenEaten.impact.waterTotal;
                 
                 assert.equal(chickenCal, 187);
                 assert.equal(chickenWater, 561.00);
                 done();
             });
          });
      });
   });
   
   it('user can put food eaten into a dated entry in diary', function(done) {
      User.findOne({ username: 'testing123' }, function(err, testUser) {
         assert.ifError(err);
         var testUserID = testUser._id;
         
         // create first new foodEaten entry to be added to a diary entry
         riceEaten.save(function(err, riceEaten) {
             assert.ifError(err);
             riceEaten.calculateInfo(FoodEaten, function(err, riceEaten) {
                 assert.ifError(err);
             
                 var riceEatenID = riceEaten._id;
                 var date = new Date();
                 var query = { createdBy: testUserID, date: date }
                 
                 // increment diary nutrition/impact fields
                 var riceCal = riceEaten.nutrition.calories;
                 var riceWater = riceEaten.impact.waterTotal;
                 var riceCarbon = riceEaten.impact.carbonTotal;
                 var diaryEntry = {
                     $push: { food: riceEatenID },
                     $inc: {
                         'nutrition.caloriesTotal': 10,
                         'impact.waterTotal': 10,
                         'impact.carbonTotal': 10
                     }
                 };
                 
                 
                 
                 Diary.findOneAndUpdate(query, diaryEntry, { upsert: true, new: true, runValidators: true }, function(err, diary) {
                     assert.ifError(err);
                     
                     // find same diary entry and add another food to it
                     beefEaten.save(function(err, beefEaten) {
                         assert.ifError(err);
                         
                         var beefEatenID = beefEaten._id;
                         var date = new Date();
                         var year = date.getFullYear();
                         var month = date.getMonth();
                         var day = date.getDate();
                         var query = {
                             createdBy: testUserID,
                             date: { "$gte": new Date(year, month, day), "$lt": new Date(year, month, day + 1) }
                         };
                         
                         var beefCal = beefEaten.nutrition.calories;
                         var beefWater = beefEaten.impact.waterTotal;
                         var beefCarbon = beefEaten.impact.carbonTotal;
                         var diaryEntry = {
                             $push: { food: beefEatenID },
                             $inc: {
                                 'nutrition.caloriesTotal': beefCal,
                                 'impact.waterTotal': beefWater,
                                 'impact.carbonTotal': beefCarbon
                             } 
                         };
                         
                         Diary.findOneAndUpdate(query, diaryEntry, { upsert: true, new: true, runValidators: true }, function(err, diary) {
                             assert.ifError(err);
                             
                             assert.notEqual(diary.nutrition.caloriesTotal, 0);
                             assert.notEqual(diary.impact.carbonTotal, 0);
                             assert.notEqual(diary.impact.waterTotal, 0);
                             
                             // query for the food IDs and check that the item name is in right order
                             var foodIDs = diary.food;
                             FoodEaten.findOne({ _id: foodIDs[0] }, function(err, foodEaten) {
                                 assert.ifError(err);
                                 assert.equal(foodEaten.item, 'Rice');
                                 FoodEaten.findOne({ _id: foodIDs[1] }, function(err, foodEaten) {
                                     assert.ifError(err);
                                     assert.equal(foodEaten.item, 'Beef');
                                     done();
                                 });
                             });
                         });
                     });
                 });
             });
         });
      }); 
   });
});

