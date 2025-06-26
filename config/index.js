import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Meetup API configuration
  meetup: {
    baseUrl: 'https://www.meetup.com/gql',
    groupUrlname: 'pick-up-basketball-amsterdam',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-GB,en;q=0.9',
      'apollographql-client-name': 'nextjs-web',
      'content-type': 'application/json',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'sec-gpc': '1',
      'x-meetup-view-id': 'dc2379c6-fa32-4897-86f6-32bb6c6be47f'
    }
  },
  
  // LaunchDarkly configuration
  launchDarkly: {
    context: {
      kind: 'server-app',
      key: 'render-app-v1',
      name: 'Render.com Server App'
    }
  },
  
  // Scheduling configuration
  scheduling: {
    defaultTestDelay: 5000, // 5 seconds for test mode
    defaultRemoveDelay: 2500, // 2.5 seconds for remove action
    defaultAdvanceDays: 7, // RSVP 7 days before event
    maxExtras: 10,
    maxEvents: 50
  },
  
  // Time formatting
  timeFormat: {
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
};

export default config; 