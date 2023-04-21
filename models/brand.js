const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        text: true,
    },
    images: {
        type: Array,
    },
}, {timestamps: true});

module.exports = mongoose.model('Brand', brandSchema);