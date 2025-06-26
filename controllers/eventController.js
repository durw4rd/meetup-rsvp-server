import meetupService from '../services/meetupService.js';
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
}

export default new EventController(); 