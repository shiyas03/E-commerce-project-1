
const { ObjectId, Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const productDetails = new mongoose.Schema({
    productId: {
        type : ObjectId,
        ref : 'Product'
    },
    userId : {
        type : ObjectId,
        ref : 'User'
    },
    orderedQuantity : {
        type : Number,
        required : true
    },
    totalSalePrice : {
        type : Number,
        required :true
    },
    addressId: {
        type: ObjectId,
        required: true,
        ref : 'User'
    },
    status : {
        type : String,
        required : true
    },
    paymentMethod :  {
        type : String,
        required : true
    },
    paymentStatus : {
        type : String,
    },
    orderedDate : {
        type : Date,
        default : Date.now 
    },
    return : {
        type : Boolean,
    }
})

const orderSchema = new mongoose.Schema({
    orderDetails: [productDetails],
    userId: {
        type: ObjectId,
        required: true,
        ref:'User'
    },
})
module.exports = mongoose.model('Order', orderSchema);