var express = require('express');
var router = express.Router();
const { listUserNames, getUserByName } = require('../public/javascripts/utils/users.js');

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

module.exports = router;
