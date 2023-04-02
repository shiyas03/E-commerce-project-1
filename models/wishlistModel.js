
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId : {
        type : ObjectId,
        ref : 'Product'
    }
})

const wishlistSchema = new mongoose.Schema({
    product : [productSchema],
    userId : {
        type : ObjectId,
    }

})

module.exports = mongoose.model('Wishlist', wishlistSchema);