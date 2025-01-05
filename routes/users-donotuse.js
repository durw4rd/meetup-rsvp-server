import express from 'express';
import { listUserNames, getUserByName } from '../public/javascripts/utils/users.js';

const router = express.Router();

router.get('/select', (req, res) => {
  const { userName } = req.body;
  const selectedUser = getUserByName(userName);
  res.json({ selectedUser });
});

router.get('/list', (req, res) => {
  const userNames = listUserNames();
  res.json({ userNames });
});

export default router;
