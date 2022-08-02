const Sequelize = require('sequelize');

////////////////////////////////////////////////////////////

const database = new Sequelize('makeup', 'root', 'root', {
    dialect: 'mysql', 
    host: 'localhost'
});

module.exports = database;