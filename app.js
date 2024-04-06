const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const User = require('./models/User');

const userRoutes= require('./routes/users');

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/user', userRoutes);

// 404 Error Handling
app.use(errorController.get404);

// Database Sync and Server Start
sequelize.sync()
  .then(() =>{
   app.listen(3000);
})
 .catch( err => console.log(err));
