const mongoose = require('mongoose');
 
const bannerSchema = new mongoose.Schema({

    heading : {
        type : String,
        required : true
    },
    subHeading : {
        type : String,
        required : true
    },
    buttonText : {
        type : String,
        required : true
    },
    buttonLink : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('Banner', bannerSchema);