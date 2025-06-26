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
    this.executedJobs = []; // Track executed jobs
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
    const jobName = createJobName(userName, eventDate, this.testMode, extras);

    // Log the scheduling
    console.log(`RSVP to event ID: ${eventId} on behalf of ${userName} and ${extras} extra buddies. It will execute at ${this.testMode ? 'immediately' : rsvpDate}!`);

    // Schedule the job
    schedule.scheduleJob(jobName, rsvpDate, async () => {
      await this.executeRSVP(eventId, userName, extras, cookieHeader, rsvpResponse, jobName);
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
   * @param {string} jobName - Name of the executed job
   */
  async executeRSVP(eventId, userName, extras, cookieHeader, rsvpResponse, jobName) {
    console.log(`Responding to ${eventId} for ${userName} and ${extras} extra buddies.`);

    const executedJob = {
      jobName,
      eventId,
      userName,
      extras,
      rsvpResponse,
      executedAt: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const response = await meetupService.rsvpToEvent(eventId, extras, cookieHeader, rsvpResponse);
      
      // Check for RSVP errors in the response
      if (response.data?.rsvp?.errors && response.data.rsvp.errors.length > 0) {
        console.log('RSVP completed with errors:', response.data.rsvp.errors);
        executedJob.status = 'error';
        
        // Extract error details
        const error = response.data.rsvp.errors[0];
        executedJob.result = {
          code: error.code || 'unknown_error',
          field: error.field,
          message: error.message || 'Unknown error occurred',
          fullError: error
        };
      } else if (response.data?.rsvp?.errors === null) {
        console.log('Mission accomplished!');
        executedJob.status = 'success';
        executedJob.result = 'RSVP completed successfully';
      } else {
        console.log('Unexpected response structure:', response.data);
        executedJob.status = 'error';
        executedJob.result = {
          code: 'unexpected_response',
          message: 'Unexpected response structure from Meetup API',
          fullError: response.data
        };
      }
    } catch (error) {
      console.error('Error executing RSVP:', error);
      executedJob.status = 'error';
      
      // Try to extract error details from the error response
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        const apiError = error.response.data.errors[0];
        executedJob.result = {
          code: apiError.code || 'api_error',
          message: apiError.message || error.message,
          fullError: apiError
        };
      } else {
        executedJob.result = {
          code: 'network_error',
          message: error.message || 'Network error occurred',
          fullError: error
        };
      }
    }

    // Add to executed jobs list
    this.executedJobs.push(executedJob);
    
    // Keep only the last 100 executed jobs to prevent memory issues
    if (this.executedJobs.length > 100) {
      this.executedJobs = this.executedJobs.slice(-100);
    }
  }

  /**
   * Get all scheduled jobs with detailed information
   * @returns {Array} Array of job objects with details
   */
  getScheduledJobs() {
    const jobList = schedule.scheduledJobs;
    const jobs = [];
    
    for (const [jobName, job] of Object.entries(jobList)) {
      try {
        // Parse job name to extract information
        const jobInfo = this.parseJobName(jobName);
        
        jobs.push({
          jobName,
          scheduledFor: job.nextInvocation(),
          ...jobInfo
        });
      } catch (error) {
        console.error(`Error parsing job ${jobName}:`, error);
        // Fallback to basic info
        jobs.push({
          jobName,
          scheduledFor: job.nextInvocation(),
          userName: 'Unknown',
          extras: 0,
          rsvpResponse: 'Unknown'
        });
      }
    }
    
    return jobs;
  }

  /**
   * Parse job name to extract user and event information
   * @param {string} jobName - The job name to parse
   * @returns {Object} Parsed job information
   */
  parseJobName(jobName) {
    // Handle test mode job names: userName Mon 7 Jul _TEST_MODE
    if (jobName.includes('_TEST_MODE')) {
      const parts = jobName.split(' ');
      if (parts.length >= 4) {
        const userName = parts[0];
        const day = parts[1];
        const date = parts[2];
        const month = parts[3];
        
        return {
          userName,
          eventDate: `${day} ${date} ${month}`,
          extras: 0,
          rsvpResponse: 'YES',
          isTestMode: true
        };
      }
    }
    
    // Handle regular job names: userName Mon 7 Jul Extras: 0
    if (jobName.includes('Extras:')) {
      const parts = jobName.split(' ');
      if (parts.length >= 5) {
        const userName = parts[0];
        const day = parts[1];
        const date = parts[2];
        const month = parts[3];
        const extrasMatch = jobName.match(/Extras: (\d+)/);
        const extras = extrasMatch ? parseInt(extrasMatch[1]) : 0;
        
        return {
          userName,
          eventDate: `${day} ${date} ${month}`,
          extras,
          rsvpResponse: 'YES',
          isTestMode: false
        };
      }
    }
    
    // Fallback for unknown format
    return {
      userName: 'Unknown',
      eventDate: 'Unknown',
      extras: 0,
      rsvpResponse: 'Unknown',
      isTestMode: false
    };
  }

  /**
   * Get executed jobs
   * @param {number} limit - Maximum number of jobs to return (default: 50)
   * @returns {Array} Array of executed job objects
   */
  getExecutedJobs(limit = 50) {
    return this.executedJobs.slice(-limit).reverse(); // Return most recent first
  }

  /**
   * Get job status summary
   * @returns {Object} Summary of pending and executed jobs
   */
  getJobStatusSummary() {
    const pendingJobs = this.getScheduledJobs();
    const executedJobs = this.getExecutedJobs(10); // Get last 10 executed jobs
    
    return {
      pending: {
        count: pendingJobs.length,
        jobs: pendingJobs
      },
      executed: {
        count: this.executedJobs.length,
        recent: executedJobs
      }
    };
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