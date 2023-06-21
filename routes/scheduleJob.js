var express = require('express');
var router = express.Router();
const schedule = require('node-schedule');
const axios = require('axios');

const users = {
  Michalaki: {
    name: 'Michal',
    cookies: process.env['mcookie'],
    sha256Hash: process.env['sha256']
  },
  Adriko: {
    name: 'Andreas',
    cookies: process.env['accokie'],
    sha256Hash: process.env['sha256']
  }
};

const events = {
  '2023-03-20': {
    name: 'Monday March 20',
    eventId: '291938277'
  },
  '2023-03-22': {
    name: 'Wednesday March 22',
    eventId: '291986961'
  },
  '2023-03-23': {
    name: 'Thursday March 23',
    eventId: '292013981'
  },
  '2023-03-27': {
    name: 'Monday March 27',
    eventId: '292092824'
  },
  '2023-03-29': {
    name: 'Wednesday March 29',
    eventId: '292133907'
  },
  '2023-04-03': {
    name: 'Monday April 03',
    eventId: '292237304'
  },
  '2023-04-05': {
    name: 'Wednesday April 05',
    eventId: '292280474'
  },
  '2023-04-10': {
    name: 'Monday April 10',
    eventId: ''
  },
  '2023-04-12': {
    name: 'Wednesday April 12',
    eventId: ''
  }
};

function createRequestBody(eventId, plusOne, user) {

  const bodyObject = {
    operationName: "rsvpToEvent",
    variables: {
      input: {
        eventId: eventId,
        guestsCount: +plusOne,
        response: "YES",
        proEmailShareOptin: false,
        proSurveyAnswers: []
      }
    },
    query: "mutation rsvpToEvent($input: RsvpInput!) {\n  rsvp(input: $input) {\n    ticket {\n      id\n      status\n      __typename\n    }\n    errors {\n      code\n      field\n      message\n      __typename\n    }\n    __typename\n  }\n}\n"
  }

  let bodyString = JSON.stringify(bodyObject);

  return bodyString;
};

router.post('/', function(req, res, next) {

  // Get the form data from the request body
  const { userName, eventDate, dateTime, plusOne } = req.body;

  // Use the user name to get the user details
  const user = users[userName];

  if (!user) {
    return res.status(400).json({ error: 'Invalid user name.' });
  }

  // Use the event date to get the event details
  const event = events[eventDate];

  if (!event) {
    return res.status(400).json({ error: 'Invalid event date.' });
  }

  // Parse the date-time string into a Date object
  const scheduledTime = new Date(dateTime);

  // Use node-schedule to schedule a cron job for the specified date-time
  const job = schedule.scheduleJob(dateTime, function() {
    console.log(`Scheduled job for ${dateTime}.`);
  });

  console.log('Shit is doing smthing!', scheduledTime);
  // Schedule the cron job
  schedule.scheduleJob(scheduledTime, async () => { // run at submitted time
    // schedule.scheduleJob('*/03 * * * * *', async () => { // run every three seconds

    console.log(`Responding to ${event.name} for ${user.name} at ${eventDate}.`);
    // console.log(createRequestBody(event.eventId));
    // console.log(user.cookies);
    try {
      const response = await axios.post("https://www.meetup.com/gql", createRequestBody(event.eventId, plusOne, user), {
        headers: {
          "accept": "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "apollographql-client-name": "nextjs-web",
          "content-type": "application/json",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-meetup-view-id": "dc2379c6-fa32-4897-86f6-32bb6c6be47f",
          "cookie": user.cookies
        },
      });
      // console.log('Response:', response.data);

      if (response.data.errors) {
        console.log(`Got an error: ${response.data.errors[0].message}`);
        return;
      }

      if (response.data.data) {
        console.log('We got through!');
        if (response.data.data.rsvp.errors === null) {
          console.log("Mission accomplished!");
        } else {
          console.log(`Response status: ${response.status}`);
          console.log(response.data.data.rsvp.errors);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  makeMagic = async () => {
    // console.log(event.eventId, plusOne);
    try {
      const response = await axios.post("https://www.meetup.com/gql", createRequestBody(event.eventId, plusOne), {
        headers: {
          "accept": "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "apollographql-client-name": "nextjs-web",
          "content-type": "application/json",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-meetup-view-id": "dc2379c6-fa32-4897-86f6-32bb6c6be47f",
          "cookie": user.cookies
        },
      });
      console.log('Response:', response.data);

      if (response.data.errors) {
        console.log(`Got an error: ${response.data.errors[0].message}`);
        return;
      }

      if (response.data.data) {
        console.log('We got through!');
        if (response.data.data.rsvp.errors === null) {
          console.log("Mission accomplished!");
        } else {
          console.log(`Response status: ${response.status}`);
          console.log(response.data.data.rsvp.errors);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  // makeMagic();

  res.json({ message: 'Form data received and scheduled.' });

});

module.exports = router;
