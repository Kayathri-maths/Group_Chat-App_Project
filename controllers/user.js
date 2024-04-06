const User = require('../models/User');
const bcrypt = require('bcrypt');

function isstringinvalid(str) {
  if (str == undefined || str.length === 0) {
    return true;
  } else {
    return false;
  }
}


const signup = async (req, res, next) => {
  try {
    const existingUser =  await User.findOne({ where: { email }});
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const phonenumber = req.body.phonenumber;

    if (isstringinvalid(name) || isstringinvalid(email) || isstringinvalid(password) || isstringinvalid(phonenumber)) {
      return res.status(400).json({ err: "Bad Parameters, Something is missing" });
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

const login = async (req, res, next) => {

}
module.exports = {
    signup,
    login
}