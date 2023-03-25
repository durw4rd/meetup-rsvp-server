var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var scheduleRouter = require('./routes/scheduleJob');

var usersRouter = require('./routes/users');
var listEventsRouter = require('./routes/listEvents');
var eventRSVPRouter = require('./routes/eventRSVP');
var pendingJobsRouter = require('./routes/pendingJobs');
var serverTimeRouter = require('./routes/serverTime');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // Using for now as the app UI, might deprecate once the React front-end is set up
app.use('/schedule-job', scheduleRouter); // Works with the current BE-only setup. To be replaced by /eventrsvp endpoint

app.use('/users', usersRouter); // TODO: Return the list of users configured on back-end
app.use('/listEvents', listEventsRouter); // TODO: Return an array of objects, each representing one upcoming event
app.use('/eventRSVP', eventRSVPRouter); // TODO: RSVP to a selected event (replica of schedule-job)
app.use('/pendingJobs', pendingJobsRouter); // TODO: Return the list of currently pending (cron) jobs
app.use('/serverTime', serverTimeRouter); // TODO: Return the server time

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
