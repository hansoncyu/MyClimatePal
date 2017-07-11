var mongoose = require('mongoose');
var wagner = require('wagner-core');
var express = require('express');
var http = require('http');
var path = require('path');

// start up server, database and models

var mLab = 'mongodb://heroku_mt5smf1m:626dhf48f2731ntrnsd15ncmb8@ds151752.mlab.com:51752/heroku_mt5smf1m'
var app = express();
var db = 'mongodb://localhost:27017/app'
require('./server/models/models.js')(wagner, mLab || db);


// use api and static files
app.use('/api', require('./server/api.js')(wagner));
app.use('/', express.static(path.join(__dirname + '/../Client', 'build')));
// var URL_ROOT = 'http://localhost:5000'

// route all other routes to index.html
app.use( /^((?!\/api\/).)*$/ , express.static(path.join(__dirname + '/../Client', 'build')));


var server = http.createServer(app);
server.listen(process.env.PORT || "5000", function() {
  console.log('listening on: ' + process.env.PORT);
});
