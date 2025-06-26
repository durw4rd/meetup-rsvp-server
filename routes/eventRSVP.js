import express from 'express';
import { validateUser, validateRSVPRequest } from '../middleware/validation.js';
import rsvpController from '../controllers/rsvpController.js';
import launchDarklyService from '../services/launchDarklyService.js';

const router = express.Router();

// Initialize LaunchDarkly service
launchDarklyService;

// This one actually isn't used anywhere (I think)
router.get('/', (req, res) => {
  res.send('Hello from server event RSVP!');
});

// This is where the magic happens
router.post('/', validateUser, validateRSVPRequest, rsvpController.scheduleRSVP);

export default router;
