const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({

    name: {
        type: String,
        requires: true
    },
    description: {
        type: String,
        required: true
    },
    image: { 
        type: String,
    }
})

module.exports = mongoose.model('Brand',brandSchema);