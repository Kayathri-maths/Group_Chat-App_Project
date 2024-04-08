const express = require('express');

const router = express.Router();

const chatController = require('../controllers/chat');

const userAuthentication  = require('../middleware/auth');
 
router.post('/sendmessages', userAuthentication.authenticate , chatController.sendMessage);
router.get('/get-messages', userAuthentication.authenticate , chatController.getMessages);

module.exports = router;
