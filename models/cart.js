const Sequelize = require('sequelize');

const database = require('../utils/database');

////////////////////////////////////////////////////////////

const Cart = database.define('cart', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
	amount: {
        //總額
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

module.exports = Cart;