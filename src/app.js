
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const request = require('request');
const app = express();
const path = require('path');

const PORT = 80;

var bodyParser = require('body-parser');
var passport = require('passport');
var keys = require('../config/keys');
var api = require('./routes/API');
var authRoutes = require('./routes/auth-routes');
var passportSetup = require('../config/passport-setup');
var cookieSession = require('cookie-session');
var history = require('connect-history-api-fallback');
var spa_fix = require('./spa-fix.js')

//mongoDB
mongoose.Promise = global.Promise;
let db = mongoose.connection.openUri('mongodb://localhost/webknowledge');

db.once('open', function() {
    console.log('Connected to mongodb')
});
db.on('error', function(err) {
    console.log(err);
});

// SPA fix
app.use(spa_fix);

//body-parser
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// set up session cookies
app.use(cookieSession({
    maxAge: 31 * 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

//set-up static files
app.use(express.static(path.join(__dirname, '../dist')));
// app.use('/static', express.static(path.join(__dirname, '../dist/assets')));

// www->non-www (NOT WORKING, IDK WHY)
function wwwRedirect(req, res, next) {
  console.log('Got url ' + req.headers.host)
  console.log('req.get("host") ' + req.get('host'))
  console.log('req.host ' + req.host)
  console.log('req.originalUrl ' + req.originalUrl)
  console.log('req.url ' + req.url)
  if (req.headers.host.slice(0, 4) === 'www.') {
      var newHost = req.headers.host.slice(4);
      return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
      console.log('New url ' + req.protocol + '://' + newHost + req.originalUrl)
  }
  next();
};

app.set('trust proxy', true);
app.use(wwwRedirect);

// additional temporary routes jfm
app.get('/about', (req,res) => {
  res.send('Author - <a href="https://github.com/ramazan793">Ramazan Fazylov </a>');
})

app.get('/dots', (req,res) => {
  res.sendFile(path.join(__dirname, '../dist/dots/index.html'))
})

// auth
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth',authRoutes.router);

//API
app.use(api.router);


// server listening
app.listen(PORT, function(){
  console.log('Server started on port ' + PORT);
});
