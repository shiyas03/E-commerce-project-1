
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
//mongoose.connect(process.env.MONGODB_CONNECTION);
mongoose.connect(process.env.MONGOATLAS)

module.exports = { mongoose }; 