var assign = require('lodash.assign');
var bodyParser = require('body-parser');
var config = require('./config');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var moment = require('moment');
var passport = require('passport');
var path = require('path');
var session = require('express-session');

var fetchGitHubUserVouch = require('./helpers/fetchGitHubUserVouch');

var GithubStrategy = require('passport-github').Strategy;
var GithubApi = require('github');
var Redis = require('ioredis');
var Promise = require('bluebird');
var Model = require('./model');
var APIRoutes = require('./routes/APIRoutes');
var IndexRoutes = require('./routes/IndexRoutes');
var UserRoutes = require('./routes/UserRoutes');

var app = express();
var redis = new Redis();
var github = new GithubApi({version: '3.0.0'});
var model = new Model(redis);

function doneify(promised, done) {
  promised.then(
    function(returnValue) {done(null, returnValue)},
    function(err) {done(err)}
  ) 
}

// authentication setup
passport.use(new GithubStrategy(
  {
    clientID: config.githubClientId,
    clientSecret: config.githubClientSecret,
    callbackURL: config.githubCallbackUrl
  },
  function(accessToken, _refreshToken, profile, done) {
    doneify(
      fetchGitHubUserVouch(github, accessToken)
        .then(function(isVouched) { 
          return model.putUser(profile, accessToken, isVouched)
        }),
      done
    );
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  doneify(model.getUserByUsername(username), done);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.moment = moment;

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: config.sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());

// routes setup
app.use('/', new IndexRoutes(model, github).router);
app.use('/user', new UserRoutes().router);
app.use('/api/v1', new APIRoutes(model).router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
