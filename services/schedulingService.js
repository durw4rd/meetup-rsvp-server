import schedule from 'node-schedule';
import meetupService from './meetupService.js';
import { calculateRSVPDate, createJobName } from '../utils/dateUtils.js';
import config from '../config/index.js';

/**
 * Service for managing scheduled jobs and RSVP operations
 */
class SchedulingService {
  constructor() {
    this.testMode = false;
    this.timeOffset = 0;
  }

  /**
   * Set test mode status
   * @param {boolean} testMode - Test mode status
   */
  setTestMode(testMode) {
    this.testMode = testMode;
  }

  /**
   * Set time offset
   * @param {number} timeOffset - Time offset in hours
   */
  setTimeOffset(timeOffset) {
    this.timeOffset = timeOffset;
  }

  /**
   * Schedule an RSVP job
   * @param {Object} rsvpData - RSVP data
   * @param {string} rsvpData.eventId - Event ID
   * @param {string} rsvpData.eventDateObj - Event date
   * @param {string} rsvpData.userName - User name
   * @param {number} rsvpData.extras - Number of extra guests
   * @param {string} rsvpData.action - Action type ('add' or 'remove')
   * @param {string} rsvpData.cookieHeader - User's cookie header
   * @returns {Object} Job information
   */
  scheduleRSVP(rsvpData) {
    const { eventId, eventDateObj, userName, extras, action, cookieHeader } = rsvpData;
    
    const eventDate = new Date(eventDateObj);
    const rsvpDate = calculateRSVPDate(eventDate, this.testMode, action, this.timeOffset);
    const rsvpResponse = action === 'remove' ? 'NO' : 'YES';
    const jobName = createJobName(userName, rsvpDate, this.testMode, extras);

    // Log the scheduling
    console.log(`RSVP to event ID: ${eventId} on behalf of ${userName} and ${extras} extra buddies. It will execute at ${this.testMode ? 'immediately' : rsvpDate}!`);

    // Schedule the job
    schedule.scheduleJob(jobName, rsvpDate, async () => {
      await this.executeRSVP(eventId, userName, extras, cookieHeader, rsvpResponse);
    });

    return {
      jobName,
      scheduledFor: rsvpDate,
      message: 'RSVP scheduled successfully'
    };
  }

  /**
   * Execute an RSVP operation
   * @param {string} eventId - Event ID
   * @param {string} userName - User name
   * @param {number} extras - Number of extra guests
   * @param {string} cookieHeader - User's cookie header
   * @param {string} rsvpResponse - RSVP response ('YES' or 'NO')
   */
  async executeRSVP(eventId, userName, extras, cookieHeader, rsvpResponse) {
    console.log(`Responding to ${eventId} for ${userName} and ${extras} extra buddies.`);

    try {
      const response = await meetupService.rsvpToEvent(eventId, extras, cookieHeader, rsvpResponse);
      
      if (response.data?.rsvp?.errors === null) {
        console.log('Mission accomplished!');
      } else {
        console.log('RSVP completed with errors:', response.data?.rsvp?.errors);
      }
    } catch (error) {
      console.error('Error executing RSVP:', error);
    }
  }

  /**
   * Get all scheduled jobs
   * @returns {Array} Array of job names
   */
  getScheduledJobs() {
    const jobList = schedule.scheduledJobs;
    return Object.keys(jobList);
  }

  /**
   * Cancel a scheduled job
   * @param {string} jobName - Name of the job to cancel
   * @returns {boolean} Success status
   */
  cancelJob(jobName) {
    try {
      const jobList = schedule.scheduledJobs;
      if (jobList[jobName]) {
        jobList[jobName].cancel();
        console.log(`Job ${jobName} cancelled successfully`);
        return true;
      } else {
        console.log(`Job ${jobName} not found`);
        return false;
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Get job count
   * @returns {number} Number of scheduled jobs
   */
  getJobCount() {
    const jobList = schedule.scheduledJobs;
    return Object.keys(jobList).length;
  }
}

export default new SchedulingService(); 