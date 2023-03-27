const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    secondName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    number : {
        type : Number,
        required : true
    },
    country : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    landMark : {
        type : String,
        required : true
    },
    pincode : {
        type : Number,
        required : true
    },
});

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: Number,
        required: true
    },   
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: ''
    },
    access: {
        type: Boolean,
        default : false
    },
    address : [addressSchema],
});




module.exports = mongoose.model('User', userSchema); 