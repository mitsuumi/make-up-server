const Sequelize = require('sequelize');

const database = require('../utils/database');

////////////////////////////////////////////////////////////

const CartItem = database.define('cartItem', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = CartItem;