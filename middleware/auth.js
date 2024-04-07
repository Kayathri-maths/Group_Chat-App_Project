const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try{
        const token = req.header('Authorization');
        console.log(token);
        const _user = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(`userId>>>>>${req.url}`,_user.userId)
        const user = await User.findByPk(_user.userId);
        req.user = user;
        next();
    }  catch(err) {
        console.log(err);
        return res.status(401).json({success: false})
    }
}

module.exports = {
    authenticate
}