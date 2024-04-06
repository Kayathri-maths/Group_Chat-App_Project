const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isstringinvalid(str) {
  if (str == undefined || str.length === 0) {
    return true;
  } else {
    return false;
  }
}


const signup = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phonenumber = req.body.phonenumber;

    const existingUser =  await User.findOne({ where: { email }});
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      await User.create({ name: name, email: email, password: hash, phonenumber: phonenumber });
      res.status(201).json({ message: 'Successfully created new User' });
    })
  }
  catch (error) {
    res.status(500).json({
      error: error
    });
  }
};

const generateAccessToken = (id, name) =>{
  return jwt.sign( { userId: id , name: name} , 'kayu457924513secretkey')
}

const login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (isstringinvalid(email) || isstringinvalid(password)) {
      return res.status(400).json({ message: "Email or password is missing", success: false });
    }
    const user = await User.findAll({ where: { email } });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
          throw new Error('Something went wrong');
        }
        if (result === true) {
           return res.status(200).json({ success: true, message: "User logged in successfully" , token: generateAccessToken(user[0].id,user[0].name)});
        } else {
          return res.status(400).json({ success: false, message: "Password is incorrect" });
        }
      });
    } else {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
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