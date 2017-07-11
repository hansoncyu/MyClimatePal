var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var status = require('http-status');
var bodyparser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

function setupAuth(User, app) {

    app.use(bodyparser.json());

    // serialize/de-serialize configuration for passport
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id , done) {
        User.findOne({ _id: id }, function(err, user) {
            done(err, user);
        });
    });

    // define local strategy to check username/password
    passport.use(new LocalStrategy(function(username, password, done) {
        User.findOne({ username: username }, function(err, user) {
           if (err) {
               return done(err);
           }

           if (!user) {
               return done(null, false, { message: 'Incorrect username.' });
           }

           // use custom comparePassword method on schema defined in user.js
           user.comparePassword(password, function(err, isMatch) {
               if (err) {
                   return done(err);
               }

               if (!isMatch) {
                   return done(null, false, { message: 'Incorrect password.' });
               }
               return done(null, user);
           });
        });
    }));

    app.use(session({
        secret: 'My little secret',
        store: new MongoStore({ url: 'mongodb://heroku_mt5smf1m:626dhf48f2731ntrnsd15ncmb8@ds151752.mlab.com:51752/heroku_mt5smf1m' })
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // api for login
    app.get('/login',
        passport.authenticate('local'), function(req, res) {
            return res.json({ user: req.user })
        });


    // api for logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // register new users
    app.put('/register', function(req, res) {
        try {
            var username = req.body.username;
            var password = req.body.password;
        } catch(e) {
            return res.status(status.BAD_REQUEST).json({ error: 'No username or password specified!' });
        }


        // find username
        User.findOne({ username: username }, function(err, user) {
            if (err) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
            }

            if (user) {
                return res.status(status.FORBIDDEN).json({ error: 'Username already exists.' });
            }

            // create new user
            var newUser = new User({
                username: username,
                password: password
            });

            newUser.save(function(err, user) {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                }

                return res.json({ user: user });
            });
        });
    });
}

module.exports = setupAuth;
