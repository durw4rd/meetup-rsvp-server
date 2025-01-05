import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const serverTime = new Date();
  const serverTimeFormated = serverTime.toLocaleString('nl-NL');
  const localTimeFormated = serverTime.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam'});

  res.render('index', { title: 'RSVP Server', serverTime: serverTimeFormated, localTime: localTimeFormated });
});

router.get('/current-time', (req, res) => {
  const serverTime = new Date().toLocaleString('nl-NL');
  const localTime = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });
  res.json({ serverTime, localTime });
});

export default router;
