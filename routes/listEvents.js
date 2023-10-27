var express = require('express');
var router = express.Router();
const axios = require('axios');
const users = require('../public/javascripts/utils/userList.js');

router.get('/:numberEvents', function(req, res, next) {
    const { numberEvents } = req.params;

    const userName = req.query.userName || "Michal"; // OR is for for backwards compatibility (WHERE/WHY?)
    if (users[userName] === undefined) {
      res.send("Unknown user");
      console.log('Received a request for unknown user name!');
      return
    } 
  
    const createRequestBody = (numberEvents) => {
        const bodyObject = {
            operationName: 'getUpcomingEvents',
            variables: { first: numberEvents, urlname: 'pick-up-basketball-amsterdam' },
            query: 'query getUpcomingEvents($urlname: String!, $first: Int, $after: String) {\n' +
              '  groupByUrlname(urlname: $urlname) {\n' +
              '    id\n' +
              '    upcomingEvents(input: {first: $first, after: $after}) {\n' +
              '      pageInfo {\n' +
              '        hasNextPage\n' +
              '        endCursor\n' +
              '        __typename\n' +
              '      }\n' +
              '      edges {\n' +
              '        node {\n' +
              '          id\n' +
              '          title\n' +
              '          dateTime\n' +
              '          timezone\n' +
              '          group {\n' +
              '            name\n' +
              '            groupPhoto {\n' +
              '              id\n' +
              '              baseUrl\n' +
              '              __typename\n' +
              '            }\n' +
              '            city\n' +
              '            state\n' +
              '            country\n' +
              '            __typename\n' +
              '          }\n' +
              '          eventUrl\n' +
              '          going\n' +
              '          images {\n' +
              '            id\n' +
              '            baseUrl\n' +
              '            __typename\n' +
              '          }\n' +
              '          eventType\n' +
              '          rsvpState\n' +
              '          __typename\n' +
              '        }\n' +
              '        __typename\n' +
              '      }\n' +
              '      __typename\n' +
              '    }\n' +
              '    __typename\n' +
              '  }\n' +
              '}\n'
        }
      
        let bodyString = JSON.stringify(bodyObject);
        return bodyString;
    };

    const setCookieHeader = () => {
        const userDetails = users[userName];
        const cookieHeader = userDetails.cookies
        return cookieHeader;
    }

    const getUpcomingEvents = async (numberEvents = 6) => {
        try {
            const response = await axios.post("https://www.meetup.com/gql", createRequestBody(numberEvents), {
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
                    "cookie": setCookieHeader()
                }
            });

            // console.log(response.data.data.groupByUrlname.upcomingEvents.edges); // array of event objects
            const upcomingEvents = response.data.data.groupByUrlname.upcomingEvents.edges;
            const eventsFormatted = upcomingEvents.map((event) => {
                const weekDays = ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];  
                const eventDateObj = new Date(event.node.dateTime); // this could be used for scheduling I think
                const eventDay = weekDays[eventDateObj.getDay()];
                const eventDate = eventDateObj.getDate();
                const eventMonth = months[eventDateObj.getMonth()];
                const eventTime = eventDateObj.getHours();
              
                return ({
                  eventDateHuman: `${eventDay}, ${eventDate} ${eventMonth}, ${eventTime}:00 UTC`,
                  eventDateObj: eventDateObj,
                  eventId: event.node.id,
                  rsvpState: event.node.rsvpState,
                  going: event.node.going
                })
            });
            
            res.send(eventsFormatted);
        } catch (error) {
            console.error('Error:', error, error.response && error.response.status, error.response && error.response.statusText);
        }
    }

    getUpcomingEvents(parseInt(numberEvents));
});

module.exports = router;