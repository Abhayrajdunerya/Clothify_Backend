const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxLength: 100,
        text: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: 2000,
        text: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        maxLength: 32,
    },
    category: {
        type: ObjectId,
        ref: 'Category',
    },
    subs: [
        {
            type: ObjectId,
            ref: 'Sub',
        }
    ],
    quantity: Number,
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type: Array
    },
    shipping: {
        type: String,
        enum: ['Yes', 'No'],
    },
    color: {
        type: String,
        enum: ['Red', 'Black', 'White', 'Blue', 'Brown', 'Yellow', 'Orange', 'Pink', 'Grey', 'Green', 'Purple']
    },
    size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex']
    },
    brand: {
        // type: String,
        // enum: ['Adidas', 'Nike', 'Puma', 'Levis', 'Zara', 'Tommy Hilfiger', 'Peter England', 'Allen Solly'],
        type: ObjectId,
        ref: 'Brand',
    },
    ratings: [
        {
            star: Number,
            postedBy: {type: ObjectId, ref: 'User'},
        },
    ],
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);