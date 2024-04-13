const Chat = require('../models/Chat');
const { Op } = require('sequelize')

const sendMessage = async (req, res, next) => {
    try {
        const user = req.user;
        console.log('user>>>>>>>', user);
        const { messages , groupId} = req.body;
        console.log('chat>>>>>>>', messages);
        console.log('chat>>>>>>>', groupId);

        const message = await Chat.create({ name: user.name, chats: messages, userId: user.id ,groupId});
        if (message) {
            return res.status(200).json({ success: true, message: "message successfully sent", messages: message, userId: user.id });
        } else {
            return res.status(400).json({ success: false, message: "Failed to sent" });
        }

    } catch (err) {
        console.log(err);
        return res.status(404).json({ success: false, message: " something wrong", error: err });
    }
}

const getMessages = async (req, res, next) => {
    try {
       
        const groupid = req.query.groupId;
        console.log('groupid', groupid)
        const allchats = await Chat.findAll({
            where:{
                groupId: groupid
            },
            order:[['createdAt','ASC']],
        }
        
        );
        console.log('alchats', allchats);
        const userId = req.user.id;
        return res.status(200).json({
            success:true,
            message: allchats,
            userId:userId
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error, success: false });
    }

}

module.exports = {
    sendMessage,
    getMessages
}