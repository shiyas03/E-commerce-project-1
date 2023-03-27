const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        default : 0
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: "User"
    }
})

module.exports = mongoose.model('Wallet', walletSchema);