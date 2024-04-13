const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const User = require('./models/User');
const Chats = require('./models/Chat');
const Group = require('./models/Group');
const UserGroup = require('./models/UserGroup');

const userRoutes= require('./routes/users');
const chatRoutes = require('./routes/chats');
const groupRoutes = require('./routes/groups');

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

//Association
User.hasMany(Chats);
Chats.belongsTo(User);

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, {
  through: UserGroup,
  onDelete: "CASCADE",
});

Group.hasMany(Chats);
Chats.belongsTo(Group, { constraints: true, onDelete: "CASCADE" });


// 404 Error Handling
app.use(errorController.get404);

// Database Sync and Server Start
sequelize.sync()
  .then(() =>{
   app.listen(3000);
})
 .catch( err => console.log(err));
