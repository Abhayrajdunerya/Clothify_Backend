const mongoose =  require('mongoose');
const {ObjectId} = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: ObjectId,
                ref: 'Product',
            },
            count: Number,
            color: String,
            // price: Number,
        },
    ],
    paymentIntent: {},
    orderStatus: {
        type: String,
        default: 'Not_Processed',
        enum: [
            'Not_Processed',
            'Processing',
            'Dispatched',
            'Cancelled',
            'Completed',
            'Cash On Delivery',
        ]
    },
    // orderTotal: Number,
    // totalAfterDiscount: Number,
    orderedBy: { type: ObjectId, ref: 'User' }

}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);