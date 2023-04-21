const express = require("express");
const router = express.Router();

// middlewares
const {authCheck, adminCheck} = require('../middlewares/auth');

// controllers
const {userCart, getUserCart, emptyCart, saveAddress, getAddress,
    applyCouponToUserCart, createOrder, orders, 
    wishlist, addToWishlist,removeFromWishlist, createCashOrder, updateUserDetails
} = require('../controllers/user');

// cart
router.post('/user/cart', authCheck, userCart);
router.get('/user/cart', authCheck, getUserCart);
router.put('/user/cart', authCheck, emptyCart);

// address
router.post('/user/address', authCheck, saveAddress);
router.get('/user/address', authCheck, getAddress);

// order
router.post('/user/order', authCheck, createOrder);          // Razorpay
router.post('/user/cash-order', authCheck, createCashOrder); // COD
router.get('/user/orders', authCheck, orders);

// wishlist
router.get('/user/wishlist', authCheck, wishlist);
router.post('/user/wishlist', authCheck, addToWishlist);
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist);

// coupon
router.post('/user/cart/coupon', authCheck, applyCouponToUserCart);

// user details
router.post('/user/update-userDetails', authCheck, updateUserDetails)


module.exports = router;