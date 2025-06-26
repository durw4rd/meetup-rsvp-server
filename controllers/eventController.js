import meetupService from '../services/meetupService.js';
import { formatEventDetails, formatAttendees } from '../utils/dateUtils.js';
import users from '../public/javascripts/utils/userList.js';

/**
 * Controller for handling event-related HTTP requests
 */
class EventController {
  /**
   * Get upcoming events
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUpcomingEvents(req, res) {
    try {
      const { numberEvents } = req.params;
      const userName = req.query.userName || "Michal";
      
      const user = users[userName];
      const events = await meetupService.getUpcomingEvents(parseInt(numberEvents), user.cookies);
      
      res.json(events);
    } catch (error) {
      console.error('Error in getUpcomingEvents controller:', error);
      res.status(500).json({ 
        error: 'Failed to fetch upcoming events',
        message: error.message 
      });
    }
  }

  /**
   * Get event details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getEventDetails(req, res) {
    try {
      const { eventId } = req.params;
      const userName = req.query.userName || "Michal";
      
      const user = users[userName];
      const eventDetails = await meetupService.getEventDetails(eventId, user.cookies);
      
      // Format the response for easier consumption
      const formattedDetails = formatEventDetails(eventDetails);
      
      res.json(formattedDetails);
    } catch (error) {
      console.error('Error in getEventDetails controller:', error);
      res.status(500).json({ 
        error: 'Failed to fetch event details',
        message: error.message 
      });
    }
  }

  /**
   * Get waitlist attendees
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getWaitlistAttendees(req, res) {
    try {
      const { eventId } = req.params;
      const userName = req.query.userName || "Michal";
      
      const user = users[userName];
      const attendeesData = await meetupService.getWaitlistAttendees(eventId, user.cookies);
      
      const formattedAttendees = formatAttendees(attendeesData.event.rsvps.edges);
      
      res.json({
        eventId,
        status: 'WAITLIST',
        attendees: formattedAttendees,
        count: formattedAttendees.length
      });
    } catch (error) {
      console.error('Error in getWaitlistAttendees controller:', error);
      res.status(500).json({ 
        error: 'Failed to fetch waitlist attendees',
        message: error.message 
      });
    }
  }

  /**
   * Get not attending attendees
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getNotAttendingAttendees(req, res) {
    try {
      const { eventId } = req.params;
      const userName = req.query.userName || "Michal";
      
      const user = users[userName];
      const attendeesData = await meetupService.getNotAttendingAttendees(eventId, user.cookies);
      
      const formattedAttendees = formatAttendees(attendeesData.event.rsvps.edges);
      
      res.json({
        eventId,
        status: 'NOT_ATTENDING',
        attendees: formattedAttendees,
        count: formattedAttendees.length
      });
    } catch (error) {
      console.error('Error in getNotAttendingAttendees controller:', error);
      res.status(500).json({ 
        error: 'Failed to fetch not attending attendees',
        message: error.message 
      });
    }
  }

  /**
   * Get attendees by custom RSVP status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAttendeesByStatus(req, res) {
    try {
      const { eventId } = req.params;
      const { status, sortField = "LOCAL_TIME", sortOrder = "ASC", first = 10 } = req.query;
      const userName = req.query.userName || "Michal";
      
      if (!status) {
        return res.status(400).json({ 
          error: 'Status parameter is required',
          message: 'Please provide a status parameter (e.g., YES, NO, WAITLIST, etc.)'
        });
      }
      
      const user = users[userName];
      const rsvpStatus = Array.isArray(status) ? status : [status];
      const attendeesData = await meetupService.getAttendeesByStatus(
        eventId, 
        rsvpStatus, 
        user.cookies, 
        sortField, 
        sortOrder, 
        parseInt(first)
      );
      
      const formattedAttendees = formatAttendees(attendeesData.event.rsvps.edges);
      
      res.json({
        eventId,
        status: rsvpStatus,
        attendees: formattedAttendees,
        count: formattedAttendees.length,
        sortField,
        sortOrder
      });
    } catch (error) {
      console.error('Error in getAttendeesByStatus controller:', error);
      res.status(500).json({ 
        error: 'Failed to fetch attendees by status',
        message: error.message 
      });
    }
  }
}

export default new EventController(); 