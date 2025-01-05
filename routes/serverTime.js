import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    const serverTime = new Date().toTimeString();
    // const serverTimeFormated = serverTime.toLocaleString('nl-NL');
    res.send(serverTime);
});

export default router;
