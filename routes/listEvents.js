import express from 'express';
import eventController from '../controllers/eventController.js';
import { validateEventId, validateUser, validateNumberOfEvents } from '../middleware/validation.js';

const router = express.Router();

// Get event details (specific route)
router.get('/details/:eventId', validateEventId, validateUser, eventController.getEventDetails);

// Get upcoming events (only keep the new route)
router.get('/upcoming/:numberEvents', validateNumberOfEvents, validateUser, eventController.getUpcomingEvents);

// Get waitlist attendees
router.get('/:eventId/waitlist', validateEventId, validateUser, eventController.getWaitlistAttendees);

// Get not attending attendees
router.get('/:eventId/not-attending', validateEventId, validateUser, eventController.getNotAttendingAttendees);

// Get attendees by custom status
router.get('/:eventId/attendees', validateEventId, validateUser, eventController.getAttendeesByStatus);

export default router;
