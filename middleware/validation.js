import users from '../public/javascripts/utils/userList.js';

/**
 * Validate user name exists in the system
 */
export const validateUser = (req, res, next) => {
  const userName = req.query.userName || req.body.userName;
  
  if (!userName) {
    return res.status(400).json({ 
      error: 'User name is required',
      field: 'userName'
    });
  }
  
  if (!users[userName]) {
    return res.status(400).json({ 
      error: 'Unknown user',
      field: 'userName',
      message: 'Received a request for unknown user name!'
    });
  }
  
  next();
};

/**
 * Validate number of events parameter
 */
export const validateNumberOfEvents = (req, res, next) => {
  const { numberEvents } = req.params;
  const numEvents = parseInt(numberEvents);
  
  if (isNaN(numEvents) || numEvents < 1 || numEvents > 50) {
    return res.status(400).json({ 
      error: 'Invalid number of events',
      field: 'numberEvents',
      message: 'Must be between 1 and 50.'
    });
  }
  
  next();
};

/**
 * Validate RSVP request body
 */
export const validateRSVPRequest = (req, res, next) => {
  const { eventId, eventDateObj, userName, extras } = req.body;
  
  if (!eventId) {
    return res.status(400).json({ 
      error: 'Event ID is required',
      field: 'eventId'
    });
  }
  
  if (!eventDateObj) {
    return res.status(400).json({ 
      error: 'Event date is required',
      field: 'eventDateObj'
    });
  }
  
  if (!userName) {
    return res.status(400).json({ 
      error: 'User name is required',
      field: 'userName'
    });
  }
  
  if (extras === undefined || extras === null) {
    return res.status(400).json({ 
      error: 'Extras count is required',
      field: 'extras'
    });
  }
  
  const extrasNum = parseInt(extras);
  if (isNaN(extrasNum) || extrasNum < 0 || extrasNum > 10) {
    return res.status(400).json({ 
      error: 'Invalid extras count',
      field: 'extras',
      message: 'Must be between 0 and 10.'
    });
  }
  
  next();
};

/**
 * Validate job deletion request
 */
export const validateJobDeletion = (req, res, next) => {
  const { jobName } = req.body;
  
  if (!jobName) {
    return res.status(400).json({ 
      error: 'Job name is required',
      field: 'jobName'
    });
  }
  
  next();
}; 