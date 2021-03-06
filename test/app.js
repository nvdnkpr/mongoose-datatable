var path = require('path');
var config = require('./config.json');

// Database Initialization
var mongoose = require('mongoose')
  , DataTable = require('..');
// Connect
mongoose.connect(config.db.host || 'localhost', config.db.database,
    config.db.port || 27017, { user:  config.db.username,
    pass: config.db.password });
// Add plugins
DataTable.configure({ debug: true, verbose: true });
mongoose.plugin(DataTable.init);
var db = mongoose.connection;
// Error handler
db.on('error', function(err) {
  console.error('DB ERROR:', err);
});
// Connection success handler
db.once('open', function() {
  console.log("Connection to database established !");

  // Load Model
  var Schema = mongoose.Schema;
  var schema = new Schema({
    str: String,
    date: Date,
    bool: Boolean
  });
  var model = mongoose.model('Test', schema);

  // Start application server
  var express = require('express');
  var app = express();
  // Views
  app.set('views', path.join(__dirname, './views'));
  app.set('view engine', 'jade');
  // Parser & basic options
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.compress());
  app.use(express.static(path.join(__dirname, './public')));
  // Routes
  app.get('/', function(req, res) {
    res.render('index');
  });
  app.get('/data', function(req, res, next) {
    model.dataTable(req.query, function(err, data) {
      if (err) return next(err);
      res.send(data);
    });
  });
  // Start listening
  app.listen(config.port);
  console.log("Application server listening on port:", config.port);
});
