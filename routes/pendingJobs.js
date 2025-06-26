import express from 'express';
import { validateJobDeletion } from '../middleware/validation.js';
import rsvpController from '../controllers/rsvpController.js';

const router = express.Router();

router.get('/', rsvpController.getPendingJobs);

router.post('/delete', validateJobDeletion, rsvpController.cancelJob);

export default router;
