const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');
const axios = require('axios');

router.get('/', function(req, res, next) {
    const jobList = schedule.scheduledJobs;
    const jobNames = Object.keys(jobList);
    // console.log(Object.keys(jobList).length);
    console.log(Object.keys(jobList));
  
    res.json({ 
      message: 'Listing pending jobs.', 
      jobs: jobNames
    });
});

router.post('/delete', function(req, res, next) {
  const jobList = schedule.scheduledJobs;
  const { jobName } = req.body;
  
  try {
    jobList[jobName].cancel();
  } catch {(e => console.log(e))}

  res.json({ 
      message: `Received delete request for ${jobName}`, 
    });
});

module.exports = router;
