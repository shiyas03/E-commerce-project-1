const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code : {
        type : String,
        required : true
    },
    type : {
        type : String,
        required : true
    },
    value : {
        type  : Number, 
        required : true
    },
    minOrder : {
        type : Number,
        required : true
    }, 
    maxDiscount : {
        type : Number,
    },
    quantity : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        default : false
    }, 
    expiryDate : {
        type : String,
        required : true
    },
    totalUsage : {
        type : Number,
    },
    userId : {
        type : ObjectId,
        ref : 'User'
    },
    order : {
        type  : ObjectId,
        ref : 'Order'
    }
})

module.exports = mongoose.model('Coupon', couponSchema); 