var mongoose = require('mongoose');
var wagner = require('wagner-core');
var express = require('express');
var http = require('http');
var path = require('path');

// start up server, database and models
var app = express();
var db = 'mongodb://localhost:27017/app'
require('./server/models/models.js')(wagner, db);


// use api and static files
app.use('/api', require('./server/api.js')(wagner));
app.use(express.static(path.join(__dirname + '\\..\\Client', 'build')));
var URL_ROOT = 'http://localhost:8081'

var server = http.createServer(app);
server.listen('8081' || 3000, process.env.IP || "0.0.0.0", function() {
  console.log('listening on: ' + URL_ROOT);
});
