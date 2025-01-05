import express from 'express';
import schedule from 'node-schedule';
import axios from 'axios';
import users from '../public/javascripts/utils/userList.js';
import getLDClient from '../public/javascripts/utils/launchDarkly.js';

const router = express.Router();
const sha256 = process.env.SHA_265; // Not currently used

// This one actually isn't used anywhere (I think)
router.get('/', (req, res) => {
  res.send('Hello from server event RSVP!');
});

/**
 * Form the payload to be sent to Meetup's backend to RSVP to an event
 * @param {string} eventId - The ID of the event to RSVP for
 * @param {number} extras - The number of extra guests to add
 * @param {string} user - The user's name on whose behalf the RSVP is made
 */
const createRequestBody = (eventId, extras, user) => {
  // Construct the body object for the Meetup GQL mutation
  const bodyObject = {
    operationName: 'rsvpToEvent',
    variables: {
      input: {
        eventId: eventId,
        guestsCount: +extras,
        response: 'YES',
        proEmailShareOptin: false,
        proSurveyAnswers: []
      }
    },
    query: "mutation rsvpToEvent($input: RsvpInput!) {\n  rsvp(input: $input) {\n    ticket {\n      id\n      status\n      __typename\n    }\n    errors {\n      code\n      field\n      message\n      __typename\n    }\n    __typename\n  }\n}\n"
  };

  const bodyString = JSON.stringify(bodyObject);
  return bodyString;
};

// Checking the LD flag state for controlling enabling/disabling app testing mode
let testMode = false;
let timeOffset = 0;

const LDcontext = {
  kind: 'server-app',
  key: 'replit',
  name: 'Replit Server App'
};

/**
 * Retrieve and store LaunchDarkly 'test-mode' flag
 */
(async function checkTestMode() {
  const LDclient = await getLDClient();
  LDclient.on('update:test-mode', () => {
    checkTestMode();
  });
  try {
    testMode = await LDclient.variation('test-mode', LDcontext, false);
    console.log(`Test Mode is: ${testMode}`);
    return testMode;
  } catch (e) {
    console.log(e);
  }
})();

/**
 * Retrieve and store LaunchDarkly 'time-offset' flag
 */
(async function checkTimeOffset() {
  const LDclient = await getLDClient();
  LDclient.on('update:time-offset', () => {
    checkTimeOffset();
  });
  try {
    timeOffset = await LDclient.variation('time-offset', LDcontext, 0);
    console.log(`Time offset is: ${timeOffset}`);
    return timeOffset;
  } catch (e) {
    console.log(e);
  }
})();

// This is where the magic happens
// Probably could use a little refactoring/cleanup
router.post('/', (req, res) => {
  // Get the form data from the request body
  const { eventId, eventDateObj, userName, extras } = req.body;

  // Use the user name to get the user details
  const user = users[userName];
  if (!user) {
    return res.status(400).json({ error: 'Invalid user name.' });
  }

  const eventDate = new Date(eventDateObj);

  // Setting the RSVP date in case of test mode ON
  let rsvpDate = false;
  if (testMode) {
    rsvpDate = new Date(Date.now() + 5000);
  } else {
    eventDate.setDate(eventDate.getDate() - 7);
    eventDate.setHours(eventDate.getHours() + timeOffset);
    rsvpDate = eventDate;
    console.log(rsvpDate);
  }

  const humanDate = new Date(rsvpDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 'Request received' confirmation message
  console.log(`RSVP to event ID: ${eventId} on behalf of ${userName} and ${extras} of his extra buddies. It will execute at ${testMode ? 'immediately' : humanDate}!`);

  // Schedule the cron job
  const jobName = `${userName} | ${
    testMode
      ? 'TEST MODE'
      : `${weekDays[humanDate.getDay()]}, ${humanDate.getDate()} ${months[humanDate.getMonth()]}`
  } | ${rsvpDate.getHours()}:00 UTC | Extras: ${extras}`;

  schedule.scheduleJob(jobName, rsvpDate, async () => {
    // 'This is happening' message
    console.log(`Responding to ${eventId} for ${userName} and ${extras} extra buddies.`);

    try {
      const response = await axios.post(
        'https://www.meetup.com/gql',
        createRequestBody(eventId, extras, user),
        {
          headers: {
            'accept': '*/*',
            'accept-language': 'en-GB,en;q=0.9',
            'apollographql-client-name': 'nextjs-web',
            'content-type': 'application/json',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sec-gpc': '1',
            'x-meetup-view-id': 'dc2379c6-fa32-4897-86f6-32bb6c6be47f',
            'cookie': user.cookies
          }
        }
      );

      // Check for errors in the response
      if (response.data.errors) {
        console.log(`Got an error: ${response.data.errors[0].message}`);
        return;
      }

      if (response.data.data) {
        console.log('We got through!');
        if (response.data.data.rsvp.errors === null) {
          console.log('Mission accomplished!');
        } else {
          console.log(`Response status: ${response.status}`);
          console.log(response.data.data.rsvp.errors);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  const jobList = schedule.scheduledJobs;
  console.log(Object.keys(jobList).length);
  // console.log(jobList[0].pendingInvocations);

  res.json({ message: 'Form data received and scheduled.' });
});

export default router;
