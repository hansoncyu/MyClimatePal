var mongoose = require('mongoose');
var wagner = require('wagner-core');
var assert = require('assert');

// set up models and wagner factories, connect to mongodb
var db = 'mongodb://localhost:27017/test'
var models = require('../models/models.js')(wagner, db);
var User = models.User;

// create new test user
var testUser = new User({
    username: 'testing123',
    password: 'Password123'
});

describe('Password authentication', function() {
    // save user to database
    it('can save user to database', function(done) {
        testUser.save(function(err) {
            assert.ifError(err);
            done();
        });
    });
    
    // find user and test password
    it('can find user and test password', function(done) {
        User.findOne({ username: 'testing123' }, function(err, user) {
            assert.ifError(err);
            
            // test for matching password
            user.comparePassword('Password123', function(err, isMatch) {
                assert.ifError(err);
                assert.equal(isMatch, true);
            });
            
            // test for wrong password
            user.comparePassword('123Password', function(err, isMatch) {
                assert.ifError(err);
                assert.equal(isMatch, false);
            });
            done();
        });
    });
    
    // delete test user
    after(function(done) {
        User.remove({ username: 'testing123' }, function(err) {
            if (err) {
                console.log('Error removing test user');
            } else {
                console.log('Removed test user');
            }
            done();
        });
    });
});

