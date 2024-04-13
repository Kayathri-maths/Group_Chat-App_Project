const express = require('express');

const router = express.Router();

const groupController = require('../controllers/group');

const userAuthentication  = require('../middleware/auth');
 
router.post('/create-group', userAuthentication.authenticate , groupController.createNewGroup );
router.get('/get-group', userAuthentication.authenticate , groupController. getUserGroups);
// router.post('/addmembers',userAuthentication.authenticate, groupController.addMemberGroup);

module.exports = router;
