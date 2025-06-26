import schedulingService from '../services/schedulingService.js';
import users from '../public/javascripts/utils/userList.js';

/**
 * Controller for handling RSVP-related HTTP requests
 */
class RSVPController {
  /**
   * Schedule an RSVP
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async scheduleRSVP(req, res) {
    try {
      const { eventId, eventDateObj, userName, extras, action } = req.body;
      const user = users[userName];

      const rsvpData = {
        eventId,
        eventDateObj,
        userName,
        extras,
        action,
        cookieHeader: user.cookies
      };

      const result = schedulingService.scheduleRSVP(rsvpData);
      
      res.json({ 
        message: 'RSVP scheduled successfully',
        jobName: result.jobName,
        scheduledFor: result.scheduledFor
      });
    } catch (error) {
      console.error('Error in scheduleRSVP controller:', error);
      res.status(500).json({ 
        error: 'Failed to schedule RSVP',
        message: error.message 
      });
    }
  }

  /**
   * Get pending jobs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPendingJobs(req, res) {
    try {
      const jobs = schedulingService.getScheduledJobs();
      const jobCount = schedulingService.getJobCount();
      
      res.json({ 
        message: 'Listing pending jobs.',
        jobs,
        count: jobCount
      });
    } catch (error) {
      console.error('Error in getPendingJobs controller:', error);
      res.status(500).json({ 
        error: 'Failed to get pending jobs',
        message: error.message 
      });
    }
  }

  /**
   * Get executed jobs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getExecutedJobs(req, res) {
    try {
      const { limit = 50 } = req.query;
      const executedJobs = schedulingService.getExecutedJobs(parseInt(limit));
      
      res.json({ 
        message: 'Listing executed jobs.',
        jobs: executedJobs,
        count: executedJobs.length
      });
    } catch (error) {
      console.error('Error in getExecutedJobs controller:', error);
      res.status(500).json({ 
        error: 'Failed to get executed jobs',
        message: error.message 
      });
    }
  }

  /**
   * Get job status summary (pending and executed jobs)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getJobStatusSummary(req, res) {
    try {
      const summary = schedulingService.getJobStatusSummary();
      
      res.json({ 
        message: 'Job status summary.',
        summary
      });
    } catch (error) {
      console.error('Error in getJobStatusSummary controller:', error);
      res.status(500).json({ 
        error: 'Failed to get job status summary',
        message: error.message 
      });
    }
  }

  /**
   * Cancel a job
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  cancelJob(req, res) {
    try {
      const { jobName } = req.body;
      const success = schedulingService.cancelJob(jobName);
      
      if (success) {
        res.json({ 
          message: `Job ${jobName} cancelled successfully`,
          jobName
        });
      } else {
        res.status(404).json({ 
          error: 'Job not found',
          jobName
        });
      }
    } catch (error) {
      console.error('Error in cancelJob controller:', error);
      res.status(500).json({ 
        error: 'Failed to cancel job',
        message: error.message 
      });
    }
  }
}

export default new RSVPController(); 