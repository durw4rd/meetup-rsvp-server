import express from 'express';
const router = express.Router();

router.get('/', function(req, res, next) {
    const serverTime = new Date().toTimeString();
    // const serverTimeFormated = serverTime.toLocaleString('nl-NL');
    res.send(serverTime);
});

export default router;
