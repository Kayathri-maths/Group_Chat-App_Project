const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const group = sequelize.define('groups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupname: {
        type: Sequelize.STRING,
        allowNull: false
    }
  
});

module.exports = group;
