import express from 'express';
const router = express.Router();
import { listUserNames, getUserByName } from '../public/javascripts/utils/users.js';

// Select user by name
router.get('/select', function(req, res, next) {
  const { userName } = req.body;
  const selectedUser = getUserByName(userName);
  res.json({ selectedUser });
});

// List names of all the users saved on the server
router.get('/list', function(req, res, next) {
  const userNames = listUserNames();
  res.json({ userNames });
});

export default router;
