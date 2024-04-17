const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phonenumber = req.body.phonenumber;

    const existingUser =  await User.findOne({ where: { email:email , phonenumber: phonenumber }});
    if (existingUser) {
        return res.status(400).json({ success:true, message: 'User already exists, Please Login.' });
      }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        throw err; // Handle error properly
      }
      try {
        await User.create({ name: name, email: email, password: hash, phonenumber: phonenumber });
        res.status(201).json({ message: 'Successfully signed up..!' });
      }   catch (error) {
        return res.status(500).json({ success: false, message: 'Error creating user' });
      }
    });
  }
  catch (error) {
    res.status(500).json({
      error: error
    });
  }
};

const generateAccessToken = (id) =>{
  return jwt.sign( { userId: id} , process.env.TOKEN_SECRET)
}

const login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findAll({ where: { email } });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
          throw new Error('Something went wrong');
        }
        if (result === true) {
           return res.status(200).json({ success: true, message: "User logged in successfully" , token: generateAccessToken(user[0].id)});
        } else {
          return res.status(400).json({ success: false, message: "User not authorized" });
        }
      });
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
}

module.exports = {
    signup,
    login,
    generateAccessToken
}