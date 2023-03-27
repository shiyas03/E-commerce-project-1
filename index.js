
const client = require('./config/connect');
require('dotenv').config();

const port = process.env.PORT;

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:true }))

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const session = require("express-session");
app.use(session({
  secret: 'mysitesessionsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge : 300000 }
}));

//for user routes
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

//for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

app.listen(port, function () {
  console.log("Server Running...");
})