
const User = require('../models/userModel');
const Products = require('../models/productModel');
const Banner = require('../models/bannerModel')
const Category = require('../models/categoryModel')
const Wallet = require('../models/walletModel')
const Brand = require('../models/brandModel')
const mongoose = require('mongoose');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const randomString = require('randomstring');
const nodemailer = require('nodemailer');

//Twilio
const accountSid = "AC72b12705b981bf156366837719003c30";
const authToken = "0d37ab20326cd001562d7cfa23fc561c";
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

//bcrypt password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

//Get register page
const loadRegister = async (req, res) => {
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//for verify user
const verifyRegister = async (req, res) => {
    try {
        //checking all fields are empty or not
        const { name, email, mobileNumber, password, confirmPassword } = req.body;
        const userData = await User.findOne({ $or: [{ mobileNumber: { $in: [mobileNumber] } }, { email: { $in: [email] } }] });
        if (userData) {
            //checking which input value is existing
            if (userData.email == email) {
                res.json({ message: 'Email already exists' })
            } else {
                res.json({ message: 'Mobile Number already exists' })
            }
        } else {
            //otp generating and sending to the user entered number
            const bcryptPassword = await securePassword(password);
            const user = new User({
                userName: name,
                email: email,
                mobileNumber: mobileNumber,
                password: bcryptPassword,
                access: true,
            });
            await user.save()
                .then(() => {
                    //setting jwt token
                    const secretKey = process.env.TOKEN_SECRET_KEY;
                    const expiration = 10000;
                    const userId = user._id;
                    const token = jwt.sign({ userId: userId }, secretKey, { expiresIn: expiration });
                    req.session.userToken = token;
                    req.session.userName = name;
                    req.session.userId = user._id;
                    res.json({ success: true })
                })
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//Get login page
const loadLogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//Verify login
const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        //checking the mail is in or not
        const userData = await User.findOne({ email: email });
        if (userData) {
            //checking the email is blocked or not
            if (userData.access === true) {
                const passwordMatch = await bcrypt.compare(password, userData.password)
                if (passwordMatch) {
                    //creating session for user using jwt
                    const secretKey = process.env.TOKEN_SECRET_KEY;
                    const expiration = 10000;
                    const userId = userData._id;
                    const token = jwt.sign({ userId: userId }, secretKey, { expiresIn: expiration });
                    req.session.userToken = token;
                    req.session.userName = userData.userName;
                    req.session.userId = userData._id;
                    res.json({ success: true })
                } else {
                    res.json({ message: "Incorrect Password" })
                }
            } else {
                res.json({ message: "This account is blocked" })
            }

        } else {
            res.json({ message: "Incorrect Email" })
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//Get home page
const loadHome = async (req, res) => {
    try {
        const bannerData = await Banner.find({ status: true })
        const brands = await Brand.find()
        const products = await Products.find({status : "Available"})
        if (req.session.userToken) {
            let walletAmount = 0;
            await Wallet.findOne({ userId: req.session.userId }, { amount: 1, _id: 0 })
                .then(async (data) => {
                    if (!data) {
                        const wallet = new Wallet({
                            amount: 0,
                            userId: req.session.userId
                        })
                        await wallet.save()
                    } else {
                        walletAmount = data.amount
                    }
                })
            req.session.wallet = walletAmount
            res.render('home', { name: req.session.userName, bannerData, walletAmount, brands, products })
        } else {
            res.render('home', { bannerData, brands, products });
        }

    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//logout
const userLogout = async (req, res) => {
    try {
        //removing user token
        delete req.session.userToken;
        delete req.session.userName;
        delete req.session.userId;
        delete req.session.walletAmount
        res.redirect('/home')
    } catch (error) {
        console.log(error.message);
    }
}

// view login with otp
const loginWithOtp = async (req, res) => {
    try {
        res.render('login-with-otp')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//view verify otp
const getOtp = async (req, res) => {
    try {
        const number = req.body.number
        const userData = await User.findOne({ mobileNumber: number })
        if (userData) {
            //generating otp
            client.verify.v2
                .services("VAb96ba66e52cca7521a93269955c19b75")
                .verifications.create({ to: '+91' + number, channel: "sms" })
                .then((verification) => {
                    console.log(verification.status);
                    req.session.mobileNumber = req.body.number;
                    res.json({ success: true })
                })
        } else {
            res.json({ message: "Your Number is not registered" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//Get resend otp
const resendOtp = async (req, res) => {
    try {
        if (req.session.mobileNumber) {
            //generating otp for resend
            client.verify.v2
                .services("VAb96ba66e52cca7521a93269955c19b75")
                .verifications.create({ to: "+91" + req.session.mobileNumber, channel: "sms" })
                .then((verification) => {
                    console.log(verification.status)
                    res.redirect('/verify-otp')
                })
        } else {
            res.redirect('/login-with-otp');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//Get verify-OTP page
const getVerifyOtp = async (req, res) => {
    try {

        res.render('verify-otp')

    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For Verify otp
const verifyOtp = async (req, res) => {
    try {
        const otp = req.body.otp;
        const number = req.session.mobileNumber;
        client.verify.v2
            .services("VAb96ba66e52cca7521a93269955c19b75")
            .verificationChecks.create({ to: "+91" + number, code: otp })
            .then(async (verification) => {
                if (verification.status == "approved") {
                    console.log(verification.status);
                    const secretKey = process.env.TOKEN_SECRET_KEY;
                    const expiration = 10000;
                    const userId = userData._id;
                    const token = jwt.sign({ userId: userId }, secretKey, { expiresIn: expiration });
                    req.session.userToken = token;
                    req.session.userName = userData.userName;
                    req.session.userId = userData._id
                    res.json({ success: true })
                } else {
                    res.json({ message: "Entered otp is incorrect" })
                }
            })
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//For get all products list
const loadProducts = async (req, res) => {
    try {
        const totalQuantity = await Products.find({ status: "Available" }).count()
        const number = Math.round((totalQuantity / 3) + 1);
        const value = req.query.value || 1;
        const categories = await Category.find().sort({ name: 1 })
        const walletAmount = req.session.wallet || 0;
        const { category, search, sort } = req.query;
        const pipeline = [];
        let products;
        if (category) {
            const categoryIds = category.split(',').map((id) => new mongoose.Types.ObjectId(id));
            pipeline.push({
                $match: {
                    category: { $in: categoryIds },
                    status: "Available"
                },
            });
            products = await Products.aggregate(pipeline);
            console.log(products)
            res.json({ products: products })
        } else if (search) {
            pipeline.push({
                $match: {
                    productName: { $regex: search, $options: 'i' },
                    status: "Available"
                },
            });
            products = await Products.aggregate(pipeline);
            res.json({ products: products })
        } else if (sort) {
            const [field, direction] = sort.split(':');
            pipeline.push(
                {
                    $match: {
                        status: "Available"
                    }
                },
                {
                    $sort: {
                        [field]: direction === 'desc' ? -1 : 1,
                    },

                })
            products = await Products.aggregate(pipeline)
            res.json({ products: products })
        } else {
            products = await Products.find({ status: "Available" }).populate('brand').limit(value * 3).skip((value * 3) - 3)
            res.render('products', { productData: products, value, name: req.session.userName, number, category: categories, walletAmount })
        }

    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For showing men products
const productsForMen = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const value = req.query.value || 1;
        const totalQuantity = await Products.find({ $and: [{ status: "Available" }, { gender: "Men" }] }).count()
        const number = Math.round(totalQuantity / 3);
        await Products.find({ $and: [{ status: "Available" }, { gender: "Men" }] }).populate('brand').limit(value * 3).skip((value * 3) - 3)
            .then(productData => {
                if (productData) {
                    res.render('products-men', { productData, value, name: req.session.userName, number, walletAmount })
                } else {
                    res.render('products-men', { name: req.session.userName, walletAmount })
                }
            })
    } catch (error) {
        console.log(error.message)
        res.render('404')
    }
}

//For showing women products
const productsForWomen = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const value = req.query.value || 1;
        const totalQuantity = await Products.find({ $and: [{ status: "Available" }, { gender: "Men" }] }).count()
        const number = Math.round(totalQuantity / 3);
        await Products.find({ $and: [{ status: "Available" }, { gender: "Women" }] }).populate('brand').limit(value * 3).skip((value * 3) - 3)
            .then(productData => {
                if (productData) {
                    res.render('products-women', { productData, value, name: req.session.userName, number, walletAmount })
                } else {
                    res.render('products-women', { name: req.session.userName, walletAmount })
                }
            })
    } catch (error) {
        console.log(error.message)
        res.render('404')
    }
}

//For show products view page
const viewProduct = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const productId = req.query.id;
        await Products.findOne({ _id: productId }).populate('brand')
            .then(data => {
                res.render('view-product', { productData: data, name: req.session.userName, walletAmount })
            })
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For user profile view
const userProfile = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const userData = await User.findOne({ _id: req.session.userId })
        res.render('user-profile', { userData, name: req.session.userName, walletAmount })
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For edit user profile details
const editUserData = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        await User.findOne({ _id: req.session.userId })
            .then(data => {
                res.render('edit-profile', { userData: data, name: req.session.userName, walletAmount })

            })
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For update edited user details
const updateUserData = async (req, res) => {
    try {
        const { userName, email, mobileNumber, userId } = req.body;
        if (!userName.trim() || !email.trim() || isNaN(mobileNumber) || !mobileNumber.trim()) {
            const userData = req.body;
            res.render('edit-profile', { error: "Check all fields", userData, name: req.session.userName, })
        } else {
            const userData = await User.findOne({ _id: userId })
            if (userData) {
                const updatedData = await User.updateOne({ _id: userId }, {
                    $set: {
                        userName: userName,
                        email: email,
                        mobileNumber: mobileNumber
                    }
                })
                if (updatedData) {
                    req.session.userName = userName;
                    res.redirect('/user-profile')
                } else {
                    console.log("Not uploading");
                }
            } else {
                console.log("No user found");
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//For user address settings 
const userAddress = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const addressData = await User.findOne({ _id: req.session.userId }, { address: 1 })
        if (addressData) {
            res.render('user-address', { addressData: addressData.address, name: req.session.userName, walletAmount })
        } else {
            res.render('user-address', { name: req.session.userName, walletAmount });
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For user upload address 
const uploadAddress = async (req, res) => {
    try {
        const { firstName, secondName, email, mobileNumber, country, state, address, landMark, pincode } = req.body
        const userData = await User.findOne({ _id: req.session.userId });
        if (userData) {
            //pushing address into address array
            const addNewAddress = await User.updateOne({ _id: req.session.userId },
                {
                    $push: {
                        address: {
                            firstName: firstName,
                            secondName: secondName,
                            email: email,
                            number: mobileNumber,
                            country: country,
                            state: state,
                            address: address,
                            landMark: landMark,
                            pincode: pincode
                        }
                    }
                })
            const checkout = req.query.checkout;
            //checking user added is from chekout page or user address page
            if (addNewAddress && checkout) {
                res.redirect('/product-checkout')
            } else {
                res.redirect('/user-address')
            }
        }


    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//For delete user Address
const deleteAddress = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.userId })
        if (userData) {
            const addressId = req.query.addressId
            const addressData = await User.updateOne({ _id: req.session.userId }, { $pull: { address: { _id: addressId } } })
            res.redirect('/user-address')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For edit user address
const editAddress = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const userData = await User.findOne({ _id: req.session.userId })
        if (userData) {
            const addressId = req.query.addressId;
            req.session.checkout = req.query.checkout;
            const addressData = await User.findOne({ "address._id": addressId }, { "address.$": 1 });
            res.render('edit-address', { addressData: addressData.address, name: req.session.userName, walletAmount });
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For update edited address
const updateAddress = async (req, res) => {
    try {
        console.log("working")
        const { firstName, secondName, email, mobileNumber, country, state, address, landMark, pincode, addressId } = req.body
        if (!firstName.trim() || !secondName.trim() || !email.trim() || !mobileNumber.trim() || isNaN(mobileNumber) ||
            !country.trim() || !state.trim() || !address.trim() || !landMark.trim() || !pincode.trim() || isNaN(pincode)) {
            const addressData = await User.findOne({ "address._id": addressId }, { "address.$": 1 });
            //res.render('edit-address', { error: "Some error, try again", addressData: addressData.address, name: req.session.userName, })
        } else {
            const updatedData = {
                firstName: firstName,
                secondName: secondName,
                email: email,
                number: mobileNumber,
                country: country,
                state: state,
                address: address,
                landMark: landMark,
                pincode: pincode
            }

            await User.updateOne({ "address._id": addressId }, {
                $set: {
                    "address.$": updatedData
                }
            });
            if (!req.session.checkout) {
                res.redirect('/user-address')
            } else {
                res.redirect('/product-checkout ')
                delete req.session.checkout;
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//For reset password on userside
const resetPassword = async (req, res) => {
    try {
        res.render('reset-otp')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For send otp to the number that user given
const resetPasswordConfirm = async (req, res) => {
    try {
        const number = req.body.number
        const userId = req.session.userId
        const userData = await User.findOne({ $and: [{ _id: userId }, { mobileNumber: number }] })
        if (userData) {
            //generating otp
            client.verify.v2
                .services("VAb96ba66e52cca7521a93269955c19b75")
                .verifications.create({ to: '+91' + number, channel: "sms" })
                .then((verification) => {
                    console.log(verification.status);
                    req.session.mobileNumber = req.body.number;
                    res.json({ success: true })
                })
            req.session.mobileNumber = number
        } else {
            res.json({ message: "Your Number is not registered" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetOtp = async (req, res) => {
    try {
        res.render('verify-reset-otp')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//for verify reset otp
const verifyResetOtp = async (req, res) => {
    try {
        const otp = req.body.otp;
        const number = req.session.mobileNumber;
        client.verify.v2
            .services("VAb96ba66e52cca7521a93269955c19b75")
            .verificationChecks.create({ to: "+91" + number, code: otp })
            .then(async (verification) => {
                if (verification.status == "approved") {
                    console.log(verification.status);
                    res.json({ success: true })
                } else {
                    res.json({ message: "Entered otp is incorrect" })
                }
            })
    } catch (error) {
        console.log(error.message);
    }
}

//For new password entry
const newPassword = async (req, res) => {
    try {
        res.render('new-password')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For verify new password
const verifyNewPassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        const password = req.body.password;
        const bcryptPassword = await securePassword(password);
        await User.findOneAndUpdate({ _id: userId }, { $set: { password: bcryptPassword } })
            .then((data) => {
                if (data) {
                    res.json({ success: true })
                } else {
                    res.json({ message: "Error Occured" })
                }
            })

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    verifyRegister,

    loadLogin,
    verifyLogin,

    loadHome,
    userLogout,

    loginWithOtp,
    getOtp,
    getVerifyOtp,
    resendOtp,
    verifyOtp,

    loadProducts,
    viewProduct,
    productsForMen,
    productsForWomen,

    userProfile,
    editUserData,
    updateUserData,

    userAddress,
    uploadAddress,
    deleteAddress,
    editAddress,
    updateAddress,

    resetPassword,
    resetPasswordConfirm,
    resetOtp,
    verifyResetOtp,
    newPassword,
    verifyNewPassword,

}