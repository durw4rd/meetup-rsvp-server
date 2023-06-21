var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const serverTime = new Date();
  const serverTimeFormated = serverTime.toLocaleString('nl-NL');
  const localTimeFormated = serverTime.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam'});

  res.render('index', { title: 'RSVP Server', serverTime: serverTimeFormated, localTime: localTimeFormated });
});

module.exports = router;
