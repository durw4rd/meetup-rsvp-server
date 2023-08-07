var express = require('express');
var router = express.Router();
const schedule = require('node-schedule');
const axios = require('axios');

const mcookie = process.env['mcookie'];
const acookie = process.env['acookie'];
const sha256 = process.env['sha256'];

const users = {
    Michalaki: {
      name: 'Michal',
      cookies: mcookie,
    },
    Adriko: {
      name: 'Andreas',
      cookies: acookie,
    }
};

function createRequestBody(eventId, extras, user) {

  const bodyObject = {
    operationName: 'rsvpToEvent',
    variables: {
      input: {
        eventId: eventId,
        guestsCount: +extras,
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

router.get('/', function(req, res, next) {

    res.send("Hello from server event RSVP!");
});

router.post('/', function(req, res, next) {

    // Get the form data from the request body
    const { eventId, eventDateObj, userName, extras } = req.body;

    // Use the user name to get the user details
    const user = users[userName];

    if (!user) {
        return res.status(400).json({ error: 'Invalid user name.' });
    }

    const eventDate = new Date(eventDateObj);
    const rsvpDate = eventDate.setDate(eventDate.getDate() - 7);
    const humanDate = new Date(rsvpDate);

    const weekDays = ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 'Request received' confirmation message
    console.log(`RSVP to event ID: ${eventId} on behalf of ${userName} and ${extras} of his extra buddies. It will execute at ${humanDate}!`);
  
    // Schedule the cron job
    const jobName = `${userName} | ${weekDays[humanDate.getDay()]}, ${humanDate.getDate()} ${months[humanDate.getMonth()]} | Extras: ${extras}`;
  
    schedule.scheduleJob(jobName, rsvpDate, async () => { // run at submitted time
    // schedule.scheduleJob('*/03 * * * * *', async () => { // run every three seconds

        // 'This are happening' message
        console.log(`Responding to ${eventId} for ${userName} and ${extras} extra buddies.`);

        try {
          const response = await axios.post("https://www.meetup.com/gql", createRequestBody(eventId, extras, user), {
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

    const jobList = schedule.scheduledJobs;
    console.log(Object.keys(jobList).length)
    // console.log(jobList[0].pendingInvocations);

    // res.append('Access-Control-Allow-Origin', ['*']);
    // res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.append('Access-Control-Allow-Headers', 'Content-Type');
  
    res.json({ message: 'Form data received and scheduled.' });
});

module.exports = router;