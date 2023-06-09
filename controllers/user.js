const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Coupon = require('../models/coupon');
const Order = require('../models/order');
const uniqueid = require('uniqid')

exports.userCart = async (req, res) => {
    // console.log(req.body);
    const {cart} = req.body;

    let products = [];

    const user = await User.findOne({email: req.user.email}).exec();

    // check if cart with logged in user id already exist
    let cartExistByThisUser = await Cart.findOne({ orderedBy: user._id }).exec();

    if (cartExistByThisUser) {
        cartExistByThisUser.remove();
        // console.log('removed old cart');
    }

    for (let i = 0; i < cart.length; i++) {
        let object = {};

        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        object.size = cart[i].size;

        // get price for creating total
        let productFromBD = await Product.findById(cart[i]._id).select('price').exec();
        object.price = productFromBD.price;

        products.push(object);
    }

    // console.log('products', products);

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
        cartTotal += products[i].price * products[i].count;
    }

    // console.log('cartTotal', cartTotal);

    let newCart = await new Cart({
        products,
        cartTotal,
        orderedBy: user._id,
    }).save();

    // console.log('NEW CART', newCart);
    res.json({ ok: true });
};

exports.getUserCart = async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).exec();

    let cart = await Cart.findOne({ orderedBy: user._id })
    .populate('products.product', '_id title price totalAfterDiscount')
    .exec();

    if (cart) {
        const { products, cartTotal, totalAfterDiscount } = cart;
        res.json({products, cartTotal, totalAfterDiscount});
    } else {
        res.json({isEmpty: true});
    }

    
};

exports.emptyCart = async (req, res) => {
    const user = await User.findOne({email: req.user.email}).exec();
    const cart = await Cart.findOneAndRemove({orderedBy: user._id}).exec();
    res.json(cart);
}

exports.saveAddress = async (req, res) => {
    const userAddress = await User.findOneAndUpdate(
        { email: req.user.email },
        { address: req.body.address }
    ).exec();

    res.json({ ok: true });
}

exports.getAddress = async (req, res) => {
    const user = await User.findOne({email: req.user.email}).select('address').exec();
    res.json(user.address);
}

exports.applyCouponToUserCart = async (req, res) => {
    const { coupon } = req.body;
    // console.log('COUPON', coupon);

    const validCoupon = await Coupon.findOne({ name: coupon }).exec();
    if (validCoupon === null) {
        return res.json({
            err: 'Invalid coupon',
        });
    }
    // console.log('VALID COUPON', validCoupon);
    
    const user = await User.findOne({ email: req.user.email }).exec();

    let { products, cartTotal } = await Cart.findOne({ orderedBy: user._id })
    .populate('products.product', '_id title price')
    .exec();

    // console.log('cartTotal', cartTotal, 'discount%', validCoupon.discount);

    let totalAfterDiscount = (
        cartTotal - (cartTotal * validCoupon.discount) /100
    ).toFixed(2);

    Cart.findOneAndUpdate(
        { orderedBy: user._id },
        { totalAfterDiscount },
        { new: true }
    ).exec();

    res.json(totalAfterDiscount);
}

exports.createOrder = async (req, res) => {
    const { razorpayResponse } = req.body;
    const user = await User.findOne({ email: req.user.email }).exec();
    // console.log('user', user);
    let { products } = await Cart.findOne({ orderedBy: user._id }).exec();

    let newOrder = await new Order({
        products,
        paymentIntent: razorpayResponse,
        orderedBy: user._id,
    }).save();

    // decrement quantiti, increment sold
    let bulkOption = products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    let updated = await Product.bulkWrite(bulkOption, {new: true});
    // console.log('PRODUCT QUANTITY-- AND SOLD++', updated);

    // console.log('NEW ORDER SAVED', newOrder);
    res.json({ ok: true });
}

exports.orders = async (req, res) => {
    let user = await User.findOne({ email: req.user.email });

    let userOrders = await Order.find({ orderedBy: user._id })
        .populate('products.product')
        .populate('products.product.brand')
        .exec();
    res.json(userOrders);
}

exports.addToWishlist = async (req, res) => {
    const {productId} = req.body;

    const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { $addToSet: { wishlist: productId } },
        { new: true }
    ).exec();

    res.json({ ok: true });
};

exports.wishlist = async (req, res) => {
    const list = await User.findOne({ email: req.user.email })
    .select('wishlist')
    .populate('wishlist')
    .exec();

    res.json(list);
}

exports.removeFromWishlist = async (req, res) => {
    const {productId} = req.params;
    const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { $pull: { wishlist: productId } }
    ).exec();

    res.json({ ok: true });
}

exports.createCashOrder = async (req, res) => {

    const { COD, couponApplied } = req.body;

    if (!COD) return res.status(400).send('Create cash order failed');

    // const { razorpayResponse } = req.body;
    const user = await User.findOne({ email: req.user.email }).exec();
    let userCart = await Cart.findOne({ orderedBy: user._id }).exec();

    let finalAmount = 0;

    if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = (userCart.totalAfterDiscount * 100)
    } else {
        finalAmount = (userCart.cartTotal * 100)
    }

    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: uniqueid(),
            amount: finalAmount,
            currency: 'INR',
            status: 'Cash On Delivery',
            created_at: Date.now(),
            receipt: uniqueid()
        },
        orderedBy: user._id,
        orderStatus: 'Cash On Delivery'
    }).save();

    // decrement quantiti, increment sold
    let bulkOption = userCart.products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    let updated = await Product.bulkWrite(bulkOption, {new: true});
    // console.log('PRODUCT QUANTITY-- AND SOLD++', updated);

    // console.log('NEW ORDER SAVED', newOrder);
    res.json({ ok: true });
}

exports.updateUserDetails = async (req, res) => {
    const {name} = req.body;
    const user = await User.findOneAndUpdate({email: req.user.email}, {name}, {new: true});
    res.json(user);
} 