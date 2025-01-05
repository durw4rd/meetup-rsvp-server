import express from 'express';
import schedule from 'node-schedule';

const router = express.Router();

router.get('/', (req, res) => {
    const jobList = schedule.scheduledJobs;
    const jobNames = Object.keys(jobList);
    console.log(Object.keys(jobList));
  
    res.json({ 
      message: 'Listing pending jobs.', 
      jobs: jobNames
    });
});

router.post('/delete', (req, res) => {
  const jobList = schedule.scheduledJobs;
  const { jobName } = req.body;
  
  try {
    jobList[jobName].cancel();
  } catch {(e => console.log(e))}

  res.json({ 
      message: `Received delete request for ${jobName}`, 
    });
});

export default router;
