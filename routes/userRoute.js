const express = require('express');
const user_route = express();

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const auth = require('../middleware/userAuth') 
const checkLogin = auth.isLogin;
const checkLogout = auth.isLogout;
const checkUser = auth.isUser;

const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController')

user_route.get('/',function(req,res){
    res.redirect('/home') 
});
  
user_route.get('/register',checkLogout,userController.loadRegister);
user_route.post('/register',userController.verifyRegister);

user_route.get('/login',checkLogout,userController.loadLogin);
user_route.post('/login',checkLogout,userController.verifyLogin);
 
user_route.get('/home',userController.loadHome);
user_route.post('/home',userController.userLogout);

user_route.get('/logout',checkLogin,userController.userLogout);

user_route.get('/password-reset',userController.resetPassword);
user_route.post('/password-reset',userController.resetPasswordConfirm);
user_route.get('/verify-reset-otp',userController.resetOtp)
user_route.post('/verify-reset-otp',userController.verifyResetOtp)
user_route.get('/new-password',userController.newPassword);
user_route.post('/new-password',userController.verifyNewPassword);

user_route.get('/login-with-otp',checkLogout,userController.loginWithOtp);
user_route.post('/login-with-otp',checkLogout,userController.getOtp);
 
user_route.get('/verify-otp',checkLogout,userController.getVerifyOtp)
user_route.post('/verify-otp',checkLogout,userController.verifyOtp)
user_route.get('/resend-otp',checkLogout,userController.resendOtp);

user_route.get('/products',userController.loadProducts);
user_route.get('/view-product',userController.viewProduct);   
user_route.get('/men-products',userController.productsForMen);
user_route.get('/women-products',userController.productsForWomen);

user_route.get('/wishlist',checkUser,cartController.loadWishlist);
user_route.post('/add-wishlist',cartController.addToWishlist);
user_route.get('/remove-wishlist',cartController.removeWishlist);

user_route.get('/cart',checkUser,cartController.loadCart);
user_route.post('/cart',cartController.loadCart);
user_route.get('/add-to-cart',checkUser,cartController.addToCart);
user_route.post('/changeQuantity',cartController.changeQuantity);
user_route.get('/remove-product',cartController.removeProduct);

user_route.post('/product-checkout',cartController.productCheckout);
user_route.get('/product-checkout',checkUser,cartController.loadCart);

user_route.get('/product-payment',checkUser,cartController.loadCart);
user_route.post('/product-payment',cartController.productPayment);

user_route.post('/place_order',checkUser,orderController.placeOrder);
user_route.post('/verify-payment',checkUser,orderController.verifyPayment);
user_route.post('/order-confirm',checkUser,orderController.orderConfirm);
user_route.get('/orders',checkUser,orderController.userOrders);
user_route.get('/cancel-order',checkUser,orderController.orderCancel);
user_route.get('/return-order',checkUser,orderController.returnOrder);
user_route.get('/return-confirm',checkUser,orderController.returnConfirm);

user_route.get('/user-profile',checkUser,userController.userProfile); 
user_route.get('/edit-profile',checkUser,userController.editUserData);
user_route.post('/edit-profile',userController.updateUserData);

user_route.get('/user-address',checkUser,userController.userAddress);
user_route.post('/user-address',userController.uploadAddress);
user_route.get('/delete-address',checkUser,userController.deleteAddress);
user_route.get('/edit-address',checkUser,userController.editAddress);
user_route.post('/edit-address',userController.updateAddress);

 
module.exports = user_route;