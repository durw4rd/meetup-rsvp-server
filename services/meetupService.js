import axios from 'axios';
import config from '../config/index.js';
import { formatDateHuman } from '../utils/dateUtils.js';

/**
 * Service for interacting with Meetup API
 */
class MeetupService {
  constructor() {
    this.baseUrl = config.meetup.baseUrl;
    this.gql2Url = 'https://www.meetup.com/gql2';
    this.headers = config.meetup.headers;
  }

  /**
   * Create GraphQL request body for upcoming events
   * @param {number} numberEvents - Number of events to fetch
   * @returns {string} JSON string of the request body
   */
  createUpcomingEventsRequestBody(numberEvents) {
    const bodyObject = {
      operationName: 'getUpcomingEvents',
      variables: { 
        first: numberEvents, 
        urlname: config.meetup.groupUrlname 
      },
      query: `query getUpcomingEvents($urlname: String!, $first: Int, $after: String) {
        groupByUrlname(urlname: $urlname) {
          id
          upcomingEvents(input: {first: $first, after: $after}) {
            pageInfo {
              hasNextPage
              endCursor
              __typename
            }
            edges {
              node {
                id
                title
                dateTime
                timezone
                group {
                  name
                  groupPhoto {
                    id
                    baseUrl
                    __typename
                  }
                  city
                  state
                  country
                  __typename
                }
                eventUrl
                going
                images {
                  id
                  baseUrl
                  __typename
                }
                eventType
                rsvpState
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
      }`
    };

    return JSON.stringify(bodyObject);
  }

  /**
   * Create GraphQL request body for event details
   * @param {string} eventId - Event ID
   * @param {Array} rsvpStatus - Optional array of RSVP statuses to filter by
   * @returns {string} JSON string of the request body
   */
  createEventDetailsRequestBody(eventId, rsvpStatus = ["YES", "ATTENDED"]) {
    const bodyObject = {
      operationName: 'getEventByIdForAttendees',
      variables: {
        eventId: eventId,
        first: 20,
        filter: {
          rsvpStatus: rsvpStatus
        },
        sort: {
          sortField: "SHARED_GROUPS",
          sortOrder: "DESC",
          hostsFirst: true
        }
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '477fb61d34976b3de86e8bd096e845d4a85d8fc0be4ff74c7f5188dfc91d3101'
        }
      }
    };

    return JSON.stringify(bodyObject);
  }

  /**
   * Create GraphQL request body for RSVP
   * @param {string} eventId - Event ID
   * @param {number} extras - Number of extra guests
   * @param {string} rsvpResponse - RSVP response ('YES' or 'NO')
   * @returns {string} JSON string of the request body
   */
  createRSVPRequestBody(eventId, extras, rsvpResponse = 'YES') {
    const bodyObject = {
      operationName: 'rsvpToEvent',
      variables: {
        input: {
          eventId: eventId,
          guestsCount: +extras,
          response: rsvpResponse,
          proEmailShareOptin: false,
          proSurveyAnswers: []
        }
      },
      query: `mutation rsvpToEvent($input: RsvpInput!) {
        rsvp(input: $input) {
          ticket {
            id
            status
            __typename
          }
          errors {
            code
            field
            message
            __typename
          }
          __typename
        }
      }`
    };

    return JSON.stringify(bodyObject);
  }

  /**
   * Create GraphQL request body for attendees by RSVP status
   * @param {string} eventId - Event ID
   * @param {Array} rsvpStatus - Array of RSVP statuses to filter by
   * @param {string} sortField - Sort field (default: "LOCAL_TIME")
   * @param {string} sortOrder - Sort order (default: "ASC")
   * @param {number} first - Number of results (default: 10)
   * @returns {string} JSON string of the request body
   */
  createAttendeesByStatusRequestBody(eventId, rsvpStatus, sortField = "LOCAL_TIME", sortOrder = "ASC", first = 10) {
    const bodyObject = {
      operationName: 'getEventByIdForAttendees',
      variables: {
        eventId: eventId,
        filter: {
          rsvpStatus: rsvpStatus
        },
        sort: {
          sortField: sortField,
          sortOrder: sortOrder
        },
        first: first
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '477fb61d34976b3de86e8bd096e845d4a85d8fc0be4ff74c7f5188dfc91d3101'
        }
      }
    };

    return JSON.stringify(bodyObject);
  }

  /**
   * Get upcoming events from Meetup API
   * @param {number} numberEvents - Number of events to fetch
   * @param {string} cookieHeader - User's cookie header
   * @returns {Promise<Array>} Array of formatted events
   */
  async getUpcomingEvents(numberEvents, cookieHeader) {
    try {
      const requestBody = this.createUpcomingEventsRequestBody(numberEvents);
      const headers = {
        ...this.headers,
        cookie: cookieHeader
      };

      const response = await axios.post(this.baseUrl, requestBody, { headers });
      
      if (!response.data?.data?.groupByUrlname?.upcomingEvents?.edges) {
        throw new Error('Invalid response structure from Meetup API');
      }

      const upcomingEvents = response.data.data.groupByUrlname.upcomingEvents.edges;
      return this.formatEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get event details from Meetup API
   * @param {string} eventId - Event ID
   * @param {string} cookieHeader - User's cookie header
   * @returns {Promise<Object>} Event details
   */
  async getEventDetails(eventId, cookieHeader) {
    try {
      const requestBody = this.createEventDetailsRequestBody(eventId);
      const headers = {
        ...this.headers,
        cookie: cookieHeader
      };

      const response = await axios.post(this.gql2Url, requestBody, { headers });
      
      if (!response.data?.data) {
        throw new Error('Invalid response structure from Meetup API');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }

  /**
   * RSVP to an event
   * @param {string} eventId - Event ID
   * @param {number} extras - Number of extra guests
   * @param {string} cookieHeader - User's cookie header
   * @param {string} rsvpResponse - RSVP response ('YES' or 'NO')
   * @returns {Promise<Object>} RSVP response
   */
  async rsvpToEvent(eventId, extras, cookieHeader, rsvpResponse = 'YES') {
    try {
      const requestBody = this.createRSVPRequestBody(eventId, extras, rsvpResponse);
      const headers = {
        ...this.headers,
        cookie: cookieHeader
      };

      const response = await axios.post(this.baseUrl, requestBody, { headers });
      
      if (response.data.errors) {
        throw new Error(`Meetup API error: ${response.data.errors[0].message}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  }

  /**
   * Get attendees by RSVP status from Meetup API
   * @param {string} eventId - Event ID
   * @param {Array} rsvpStatus - Array of RSVP statuses to filter by
   * @param {string} cookieHeader - User's cookie header
   * @param {string} sortField - Sort field (default: "LOCAL_TIME")
   * @param {string} sortOrder - Sort order (default: "ASC")
   * @param {number} first - Number of results (default: 10)
   * @returns {Promise<Object>} Attendees data
   */
  async getAttendeesByStatus(eventId, rsvpStatus, cookieHeader, sortField = "LOCAL_TIME", sortOrder = "ASC", first = 10) {
    try {
      const requestBody = this.createAttendeesByStatusRequestBody(eventId, rsvpStatus, sortField, sortOrder, first);
      const headers = {
        ...this.headers,
        cookie: cookieHeader
      };

      const response = await axios.post(this.gql2Url, requestBody, { headers });
      
      if (!response.data?.data) {
        throw new Error('Invalid response structure from Meetup API');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching attendees by status:', error);
      throw error;
    }
  }

  /**
   * Get waitlist attendees
   * @param {string} eventId - Event ID
   * @param {string} cookieHeader - User's cookie header
   * @returns {Promise<Object>} Waitlist attendees data
   */
  async getWaitlistAttendees(eventId, cookieHeader) {
    return this.getAttendeesByStatus(eventId, ["WAITLIST"], cookieHeader, "LOCAL_TIME", "ASC", 10);
  }

  /**
   * Get not attending attendees
   * @param {string} eventId - Event ID
   * @param {string} cookieHeader - User's cookie header
   * @returns {Promise<Object>} Not attending attendees data
   */
  async getNotAttendingAttendees(eventId, cookieHeader) {
    return this.getAttendeesByStatus(eventId, ["EXCUSED_ABSENCE", "NO_SHOW", "NO"], cookieHeader, "LOCAL_TIME", "DESC", 10);
  }

  /**
   * Format events from Meetup API response
   * @param {Array} events - Raw events from API
   * @returns {Array} Formatted events
   */
  formatEvents(events) {
    return events.map((event) => {
      const eventDateObj = new Date(event.node.dateTime);
      
      return {
        eventDateHuman: formatDateHuman(eventDateObj),
        eventDateObj: eventDateObj,
        eventId: event.node.id,
        rsvpState: event.node.rsvpState,
        going: event.node.going
      };
    });
  }
}

export default new MeetupService(); 