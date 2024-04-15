const express = require('express');

const router = express.Router();

const groupController = require('../controllers/group');

const userAuthentication  = require('../middleware/auth');
 
  router.post('/create-group', userAuthentication.authenticate , groupController.createNewGroup );
  router.get('/get-group', userAuthentication.authenticate , groupController. getUserGroups);
  router.get('/getgroupmembers',userAuthentication.authenticate , groupController.getGroupMembers);
  router.post('/addnewmember',userAuthentication.authenticate ,groupController.addNewMembers);
  router.patch('/makegroupadmin',groupController.makeAdmin);
  router.delete('/removegroupmember' ,groupController.removeUser);
  router.delete('/deletegroup',groupController.deleteGroup);

module.exports = router;
