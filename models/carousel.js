const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    crousel_id: {
        type: String,
        required: true,
        unique: true,
    },
    images: {
        type: Array
    },
}, {timestamps: true});

module.exports = mongoose.model('Carousel', carouselSchema);