const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const chats = sequelize.define('chats', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    chats: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = chats;
