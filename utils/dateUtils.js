import config from '../config/index.js';

/**
 * Format a date object into a human-readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateHuman = (date) => {
  const weekDays = config.timeFormat.weekDays;
  const months = config.timeFormat.months;
  
  const day = weekDays[date.getDay()];
  const dateNum = date.getDate();
  const month = months[date.getMonth()];
  const hour = date.getHours();
  
  return `${day}, ${dateNum} ${month}, ${hour}:00 UTC`;
};

/**
 * Calculate RSVP date based on event date and configuration
 * @param {Date} eventDate - The event date
 * @param {boolean} testMode - Whether test mode is enabled
 * @param {string} action - The action type ('remove' or 'add')
 * @param {number} timeOffset - Time offset in hours
 * @returns {Date} The calculated RSVP date
 */
export const calculateRSVPDate = (eventDate, testMode, action, timeOffset = 0) => {
  if (testMode) {
    return new Date(Date.now() + config.scheduling.defaultTestDelay);
  }
  
  if (action === 'remove') {
    return new Date(Date.now() + config.scheduling.defaultRemoveDelay);
  }
  
  const rsvpDate = new Date(eventDate);
  rsvpDate.setDate(rsvpDate.getDate() - config.scheduling.defaultAdvanceDays);
  rsvpDate.setHours(rsvpDate.getHours() + timeOffset);
  
  return rsvpDate;
};

/**
 * Create a job name for scheduling
 * @param {string} userName - The user's name
 * @param {Date} rsvpDate - The RSVP date
 * @param {boolean} testMode - Whether test mode is enabled
 * @param {number} extras - Number of extra guests
 * @returns {string} The job name
 */
export const createJobName = (userName, rsvpDate, testMode, extras) => {
  if (testMode) {
    return `${userName} | TEST MODE | ${rsvpDate.getHours()}:00 UTC | Extras: ${extras}`;
  }
  
  const formattedDate = formatDateHuman(rsvpDate);
  return `${userName} | ${formattedDate} | Extras: ${extras}`;
};

/**
 * Format attendee data from event details response
 * @param {Array} rsvpEdges - Array of RSVP edges from the API response
 * @returns {Array} Formatted attendee data
 */
export const formatAttendees = (rsvpEdges) => {
  return rsvpEdges.map(edge => {
    const { member, status, guestsCount, isHost, updated, isFirstEvent, payStatus, hasWaitlistPriority } = edge.node;
    
    return {
      id: member.id,
      name: member.name,
      status: status,
      guestsCount: guestsCount || 0,
      isHost: isHost,
      updated: updated,
      isFirstEvent: isFirstEvent,
      payStatus: payStatus,
      hasWaitlistPriority: hasWaitlistPriority,
      eventsAttended: member.eventsAttended,
      isFamiliarFace: member.isFamiliarFace,
      noShowCount: member.noShowCount || 0,
      topics: member.topics?.edges?.map(topicEdge => topicEdge.node.name) || [],
      commonTopics: member.commonTopics?.edges?.map(topicEdge => topicEdge.node.name) || [],
      photoUrl: member.memberPhoto ? `${member.memberPhoto.baseUrl}${member.memberPhoto.id}/member_${member.memberPhoto.id}.jpeg` : null
    };
  });
};

/**
 * Format event details for easier consumption
 * @param {Object} eventData - Raw event data from API
 * @returns {Object} Formatted event details
 */
export const formatEventDetails = (eventData) => {
  const { event } = eventData;
  
  return {
    id: event.id,
    title: event.title,
    eventUrl: event.eventUrl,
    dateTime: event.dateTime,
    endTime: event.endTime,
    status: event.status,
    eventType: event.eventType,
    venue: event.venue,
    canSeeAttendees: event.canSeeAttendees,
    rsvpStats: {
      totalCount: event.rsvps.totalCount,
      yesCount: event.rsvps.yesCount,
      noCount: event.rsvps.noCount,
      waitlistCount: event.rsvps.waitlistCount
    },
    attendees: formatAttendees(event.rsvps.edges),
    actions: event.actions,
    eventHosts: event.eventHosts
  };
}; 