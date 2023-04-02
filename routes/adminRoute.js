const express = require('express');
const admin_route = express();

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

const auth = require('../middleware/adminAuth')
const checkLogin = auth.isLogin;
const checkLogout = auth.isLogout;

const multer = require('../config/config')
const upload = multer.upload

const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const bannerController = require('../controllers/bannerController')

admin_route.get('/', checkLogin, adminController.loadDashboard);

admin_route.get('/login', checkLogout, adminController.loadLogin)
admin_route.post('/login', adminController.verifyAdmin);

admin_route.post('/logout', adminController.adminLogout);

admin_route.get('/products-list', productController.loadProducts);
admin_route.get('/add-products', productController.loadAddForm);
admin_route.post('/add-products', upload.array('images', 5), productController.uploadProduct);
admin_route.get('/edit-product', productController.editProduct);
admin_route.post('/edit-product', upload.array('images', 5), productController.updateProduct);
admin_route.get('/delete-image', checkLogin, productController.imageDelete);
admin_route.get('/status-product', productController.changeStatusProduct);
admin_route.get('/view-product', checkLogin, productController.viewProduct);
admin_route.post('/search-product', productController.searchProduct);

admin_route.get('/category-list', checkLogin, productController.loadCategory);
admin_route.get('/add-category', checkLogin, productController.loadAddCategory);
admin_route.post('/add-category', upload.single('image'), productController.uploadCategory);
admin_route.get('/status-category', checkLogin, productController.changeStatusCategory)
admin_route.get('/delete-categoryImage', checkLogin, productController.deleteCategoryImage)
admin_route.get('/edit-category', checkLogin, productController.editCategory)
admin_route.post('/edit-category', upload.single('image'), productController.updateCategory);

admin_route.get('/brands-list', checkLogin, productController.loadBrands);
admin_route.get('/add-brands', checkLogin, productController.loadAddBrand);
admin_route.post('/add-brands', upload.single('image'), productController.uploadBrand);
admin_route.get('/delete-brand', checkLogin, productController.deleteBrand);
admin_route.get('/edit-brand', checkLogin, productController.editBrand);
admin_route.get('/delete-brandImage', checkLogin, productController.deleteBrandImage);
admin_route.post('/edit-brand', upload.single('image'), productController.updateBrand);

admin_route.get('/users-list', adminController.loadUsers);
admin_route.get('/user-access', adminController.userAccess);

admin_route.get('/orders-list', checkLogin, adminController.ordersList); 
admin_route.post('/status-order', checkLogin,adminController.statusOrder);

admin_route.get('/coupons-list', checkLogin,adminController.couponList);
admin_route.get('/add-coupon', checkLogin,adminController.addCoupon);
admin_route.post('/add-coupon',adminController.uploadCoupon);
admin_route.get('/edit-coupon', checkLogin,adminController.loadEditCoupon);
admin_route.post('/edit-coupon',adminController.updateCoupon);
admin_route.get('/coupon-status', checkLogin,adminController.couponStatus)

admin_route.get('/banners-list', checkLogin,bannerController.bannerList);
admin_route.get('/add-banner', checkLogin,bannerController.addBanner);
admin_route.post('/add-banner',upload.single('image'),bannerController.uploadBanner);
admin_route.get('/edit-banner', checkLogin,bannerController.editBanner);
admin_route.post('/edit-banner',upload.single('image'),bannerController.updateBanner)
admin_route.post('/delete-banner',bannerController.deleteBanner);

admin_route.get('/sales-report', checkLogin,adminController.salesReport)
admin_route.post('/sales-report',adminController.salesPdf)

module.exports = admin_route;
 