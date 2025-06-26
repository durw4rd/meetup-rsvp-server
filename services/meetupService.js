import axios from 'axios';
import config from '../config/index.js';
import { formatDateHuman } from '../utils/dateUtils.js';

/**
 * Service for interacting with Meetup API
 */
class MeetupService {
  constructor() {
    this.baseUrl = config.meetup.baseUrl;
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