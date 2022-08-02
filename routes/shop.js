const express = require('express');

const shopController = require('../controllers/shop');

////////////////////////////////////////////////////////////

const router = express.Router();

router.get('/shopList', shopController.getIndex);

router.get('/cart', shopController.getCart);
router.post('/cart-add-item', shopController.postCartAddItem);
router.post('/cart-delete-item', shopController.postCartDeleteItem);
router.post('/plus-one', shopController.plusOne);




module.exports = router;

