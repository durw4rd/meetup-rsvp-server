import express from 'express';
import { validateUser, validateNumberOfEvents } from '../middleware/validation.js';
import eventController from '../controllers/eventController.js';

const router = express.Router();

router.get('/:numberEvents', validateNumberOfEvents, validateUser, eventController.getUpcomingEvents);

export default router;
