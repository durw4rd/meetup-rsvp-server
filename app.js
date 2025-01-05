import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import indexRouter from './routes/index.js';
import listEventsRouter from './routes/listEvents.js';
import eventRSVPRouter from './routes/eventRSVP.js';
import pendingJobsRouter from './routes/pendingJobs.js';
import serverTimeRouter from './routes/serverTime.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // Using for now as the app UI, might deprecate once the React front-end is set up

app.use('/listEvents', listEventsRouter); // GET -> returns a list of upcoming Meetup events
app.use('/eventRSVP', eventRSVPRouter); // POST -> schedules RSVP for a selected event
app.use('/pendingJobs', pendingJobsRouter); // GET -> returns the list of currently pending cron jobs | DELETE -> deletes the selected pending cron job
app.use('/serverTime', serverTimeRouter); // (not used) GET -> returns the server time
app.use('/status', (req, res) => res.send('Server is running!'));

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

export default app;
