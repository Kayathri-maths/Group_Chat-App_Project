const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const http = require('http');
const server = http.createServer(app);
const io= require('socket.io')(server);


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
app.use((req, res) => { 
 // console.log('req url>>>>>>>', req.url)
   res.sendFile(path.join(__dirname, req.url))
});

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

//socket connection
io.on("connection", (socket) => {
  console.log(`web socket connected on ${socket.id}`);
  socket.on("send-message" , (message, groupId) => {
    socket.broadcast.emit("received-message" , message, groupId)
    console.log('message', message)
  })
})

// Database Sync and Server Start
sequelize.sync()
  .then(() =>{
   server.listen(process.env.PORT || 3000 , () => {
    console.log('server is running on port 3000');
   });
})
 .catch( err => console.log(err));
