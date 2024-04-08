const { where } = require('sequelize');
const Chat = require('../models/Chat');

const sendMessage = async (req, res, next) => {
    try {
        const user = req.user;
        console.log('user>>>>>>>',user);
        const chat = req.body.message;
        console.log('chat>>>>>>>',chat);

        const message = await Chat.create({ name:user.name, chats: chat, userId: user.id, });
        if(message) {
             return  res.status(200).json({ success: true, message: "message successfully sent" , messages: message,userId: user.id});
        }  else {
            return  res.status(400).json({ success: false, message: "Failed to sent" });
        }

    } catch(err) {
        console.log(err);
        return res.status(404).json({ success: false, message: " something wrong" , error: err});
    }
}

const getMessages = async (req, res, next) => {
    try{
        const messages = await Chat.findAll();
        res.status(201).json({ messages: messages, success: true ,userId: req.user.id})
    } catch (error){
        console.log(error)
        return res.status(500).json({ error: error, success: false });
    }
       
}

module.exports = {
    sendMessage,
    getMessages
}