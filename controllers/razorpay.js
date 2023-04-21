const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/user')
const Cart = require('../models/cart')

exports.order = async (req, res) => {
    // find user
    const user = await User.findOne({ email: req.user.email }).exec();

    // get user cart total
    const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderedBy: user._id }).exec();

    const couponApplied = req.body.couponApplied;

    // console.log('COUPON APPLIED', couponApplied);
    // console.log('CART TOTAL', cartTotal, 'AFTER DIS%', totalAfterDiscount);

    let finalAmount = 0;

    if (couponApplied && totalAfterDiscount) {
        finalAmount = (totalAfterDiscount * 100)
    } else {
        finalAmount = (cartTotal * 100)
    }


  try {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: finalAmount,
        currency: 'INR',
        receipt: crypto.randomBytes(10).toString('hex'),
    }

    instance.orders.create(options, (err, order) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: 'Something Went Wrong!' });
        }
        res.status(200).json({ success: true, cartTotal, totalAfterDiscount, payable: finalAmount, data: order });
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Internal Server Error!' });
  }  
};

exports.verify = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // console.log(req.body);

        const sign = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');
        
        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ success: true, razorpay_order_id, razorpay_payment_id, message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid signature sent!' });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Internal Server Error!' });
    }
}