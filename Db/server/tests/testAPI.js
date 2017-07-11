var mongoose = require('mongoose');
var wagner = require('wagner-core');
var assert = require('assert');
var express = require('express');
var status = require('http-status');
var superagent = require('superagent');
var http = require('http');



// var URL_ROOT = 'http://react-tutorial.hansonyu.c9users.io:8082'
var URL_ROOT = 'http://localhost:8082'

describe('API', function() {
   
   var User, Food, FoodEaten, Diary, server, app;
   
   before(function(done) {
        app = express();
       
       // set up models and wagner factories, connect to mongodb
        var db = 'mongodb://localhost:27017/test'
        var models = require('../models/models.js')(wagner, db);
        User = models.User;
        Food = models.Food;
        FoodEaten = models.FoodEaten;
        Diary = models.Diary;
        
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
        
        // set up server
        app.use('/api', require('../api.js')(wagner));
        
        server = http.createServer(app);
        server.listen('8082' || 3000, process.env.IP || "0.0.0.0", function() {
            console.log('listening on: ' + URL_ROOT);
            done();
        });
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
       server.close();
       console.log('Database cleared and server closed!');
       done();
   });
   
   
   it('can register new user and find existing users', function(done) {
      var url = URL_ROOT + '/api/register';
      var newUser = { username: 'testing123', password: 'Password123' };
      superagent.put(url).send(newUser).end(function(err, res) {
          assert.ifError(err);
          assert.equal(res.status, status.OK);
          User.findOne({ username: 'testing123' }, function(err, user) {
              assert.ifError(err);
              assert.equal(user.username, 'testing123');
              
              // try to register another user with same username and different password
              var repeatUser = { username: 'testing123', password: 'Password123' };
              superagent.put(url).send(repeatUser).end(function(err, res) {
                  var message = JSON.parse(res.text).error;
                  assert.equal(message, "Username already exists.");
                  done();
              });
          });
          
       });
   });
   
  it('can authenticate login attempt', function(done) {
      var superagentSession = superagent.agent();
      var url = URL_ROOT + '/api/login';
      var correctPass = { username: 'testing123', password: 'Password123' };
      var wrongPass = { username: 'testing123', password: 'Password' };
      superagentSession.get(url).query(correctPass).end(function(err, res) {
          assert.ifError(err);
          var message = JSON.parse(res.text).user.username;
          assert.equal(message, 'testing123');
 
          // log out
          url = URL_ROOT + '/api/logout';
          superagentSession.get(url).end(function(err, res) {
              
              // log in with wrong password
              url = URL_ROOT + '/api/login';
              superagentSession.get(url).query(wrongPass).end(function(err, res) {
                  assert.equal(res.text, 'Unauthorized');
                  url = URL_ROOT + '/api/logout';
                  superagentSession.get(url).end(function(err, res) {
                      done();
                  });
              });
          });
      });
  });
  
  it('can make new ref food', function(done) {
      // log in to set req.user
      var superagentSession = superagent.agent();
      var url = URL_ROOT + '/api/login';
      var correctPass = { username: 'testing123', password: 'Password123' };
      superagentSession.get(url).query(correctPass).end(function(err, res) {
          assert.ifError(err);
          
          // make new food
          var chicken = {
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
        };
          url = URL_ROOT + '/api/me/newfood';
          superagentSession.put(url).send(chicken).end(function(err, res) {
              assert.ifError(err);
              var response = JSON.parse(res.text).food._id;
              assert.equal(response, 'Chicken Breast');
              
              // search database for new food
              Food.findOne({ _id: 'Chicken Breast' }, function(err, food) {
                  assert.ifError(err);
                  assert.equal(food.nutrition.calories, 165);
                  
                  // add another ref food for later use
                  var rice = {
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
                    };
                  superagentSession.put(url).send(rice).end(function(err, res) {
                     assert.ifError(err);
                     response = JSON.parse(res.text).food._id;
                     assert.equal(response, 'Rice');
                     done();
                  });
              });
          });
              
      });
  });
  
  it('can add diary entries', function(done) {
     
     var superagentSession = superagent.agent();
     var url = URL_ROOT + '/api/login';
     var correctPass = { username: 'testing123', password: 'Password123' };
     superagentSession.get(url).query(correctPass).end(function(err, res) {
         
         // create new food eaten and add to diary entry
         var chickenEaten = {
             foodEaten: {
             _id: '000000000000000000000001',
            item: 'Chicken Breast',
            serving: {
                amount: 4,
                unit: 'oz'
            }
             },
             date: new Date()
             
         };
        url = URL_ROOT + '/api/me/diary';
        superagentSession.put(url).send(chickenEaten).end(function(err, res) {
           assert.ifError(err);
           var response = JSON.parse(res.text).diary;
           assert.equal(response.food[0]._id, '000000000000000000000001');
           
           // add another food to see if it is pushing food eaten into diary properly
           var riceEaten = {
               foodEaten: {
               _id: '000000000000000000000002',
                item: 'Rice',
                serving: {
                    amount: 300,
                    unit: 'g'
                }
            },
            date: new Date()
           };
            superagentSession.put(url).send(riceEaten).end(function(err, res) {
               assert.ifError(err);
               response = JSON.parse(res.text).diary;
               assert.equal(response.food[1]._id, '000000000000000000000002');
               done();
            });
        });
     });
  });
  
  it('can find diary entries of user', function(done) {
     var superagentSession = superagent.agent();
     var url = URL_ROOT + '/api/login';
     var correctPass = { username: 'testing123', password: 'Password123' };
     superagentSession.get(url).query(correctPass).end(function(err, res) {
         assert.ifError(err);
         
         var date = new Date();
         var year = date.getFullYear();
         var month = date.getMonth() + 1; // get date object is in 0 index but making new date obj isn't
         var day = date.getDate();
         
         var payload = { date: year + ', ' + month + ', ' + day }
         
         url = URL_ROOT + '/api/me';
         superagentSession.get(url).query(payload).end(function(err, res) {
             assert.ifError(err);
             var response = JSON.parse(res.text).diary
             assert.equal(response.food[0].item, 'Chicken Breast');
             assert.equal(response.food[1].item, 'Rice');
             done();
         });
     }); 
  });
  
  it('can delete diary entries and update nutrition/impact info', function(done) {
     var superagentSession = superagent.agent();
     var url = URL_ROOT + '/api/login';
     var correctPass = { username: 'testing123', password: 'Password123' };
     superagentSession.get(url).query(correctPass).end(function(err, res) {
         assert.ifError(err);
         
         url = URL_ROOT + '/api/me/remove';
         var payload = { entry: '000000000000000000000002' };
         superagentSession.delete(url).send(payload).end(function(err, res) {
             assert.ifError(err);
             var message = JSON.parse(res.text).diary;
             assert.equal(message.food.length, 1);
             done();
         });
     });
  });
  
  it('can search for created ref food', function(done) {
      var url = URL_ROOT + '/api/search'
      var query = { search: 'chicken' };
      
      superagent.get(url).query(query).end(function(err, res) {
          assert.ifError(err);
          var response = JSON.parse(res.text);
          assert.equal(response.food[0]._id, 'Chicken Breast');
          
          query = { search: 'rice' };
          
          superagent.get(url).query(query).end(function(err, res) {
              assert.ifError(err);
              
              response = JSON.parse(res.text);
              assert.equal(response.food[0]._id, 'Rice');
              
              // random food should return empty results
              query = { search: 'ice cream' };
              
              superagent.get(url).query(query).end(function(err,res) {
                  response = JSON.parse(res.text);
                  assert.equal(response.food.length, 0);
                  done();
              })
          });
      });
  });
   
});
