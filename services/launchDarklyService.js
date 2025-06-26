import getLDClient from '../public/javascripts/utils/launchDarkly.js';
import config from '../config/index.js';
import schedulingService from './schedulingService.js';

/**
 * Service for managing LaunchDarkly feature flags
 */
class LaunchDarklyService {
  constructor() {
    this.client = null;
    this.context = config.launchDarkly.context;
    this.initialize();
  }

  /**
   * Initialize LaunchDarkly client and set up flag listeners
   */
  async initialize() {
    try {
      this.client = await getLDClient();
      this.setupFlagListeners();
      await this.updateFlags();
    } catch (error) {
      console.error('Error initializing LaunchDarkly service:', error);
    }
  }

  /**
   * Set up listeners for flag changes
   */
  setupFlagListeners() {
    this.client.on('update:test-mode', () => {
      this.updateTestMode();
    });

    this.client.on('update:time-offset', () => {
      this.updateTimeOffset();
    });
  }

  /**
   * Update all flags
   */
  async updateFlags() {
    await this.updateTestMode();
    await this.updateTimeOffset();
  }

  /**
   * Update test mode flag
   */
  async updateTestMode() {
    try {
      const testMode = await this.client.variation('test-mode', this.context, false);
      schedulingService.setTestMode(testMode);
      console.log(`Test Mode is: ${testMode}`);
    } catch (error) {
      console.error('Error updating test mode flag:', error);
    }
  }

  /**
   * Update time offset flag
   */
  async updateTimeOffset() {
    try {
      const timeOffset = await this.client.variation('time-offset', this.context, 0);
      schedulingService.setTimeOffset(timeOffset);
      console.log(`Time offset is: ${timeOffset}`);
    } catch (error) {
      console.error('Error updating time offset flag:', error);
    }
  }

  /**
   * Get current test mode status
   * @returns {boolean} Test mode status
   */
  async getTestMode() {
    try {
      return await this.client.variation('test-mode', this.context, false);
    } catch (error) {
      console.error('Error getting test mode flag:', error);
      return false;
    }
  }

  /**
   * Get current time offset
   * @returns {number} Time offset in hours
   */
  async getTimeOffset() {
    try {
      return await this.client.variation('time-offset', this.context, 0);
    } catch (error) {
      console.error('Error getting time offset flag:', error);
      return 0;
    }
  }
}

export default new LaunchDarklyService(); 