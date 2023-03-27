const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description : { 
        type : String,
        required : true
    },
    gender : {
        type : String,
        requied : true
    },
    image : {
        type : String,
    },
    status : {
        type : String,
    }

})

module.exports = mongoose.model('Category', categorySchema); 