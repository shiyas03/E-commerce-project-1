const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    
    productName: {
        type: String,
        require: true
    },
    skuCode : {
        type : String,
        require : true
    },
    brand: {
        type: ObjectId,
        ref : 'Brand'
    },
    category : {
        type: ObjectId,
        ref : 'Category'
    },
    gender : {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
    },
    quantity : {
        type : Number,
        required : true
    },
    status : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type : Array
    },
})


module.exports = mongoose.model('Product', productSchema); 