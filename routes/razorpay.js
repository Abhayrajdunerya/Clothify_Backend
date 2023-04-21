const express = require("express");
const router = express.Router();

// middlewares
const {authCheck, adminCheck} = require('../middlewares/auth');

// controllers
const {order, verify} = require('../controllers/razorpay');

router.post('/payment/order', authCheck, order);
router.post('/payment/verify', authCheck, verify);

module.exports = router;