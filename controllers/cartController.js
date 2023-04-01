const Cart = require('../models/cartModel')
const Products = require('../models/productModel')
const User = require('../models/userModel');
const Coupon = require('../models/couponModel')
const Wishlist = require('../models/wishlist')
const Wallet = require('../models/walletModel')

//For view wishlisted products
const loadWishlist = async (req, res) => {
    try {
        const walletAmount = req.session.wallet || 0;
        const userId = req.session.userId
        const productData = await Wishlist.findOne({ userId: userId }).populate('product.productId')
        if (productData) {
            res.render('wishlist', { productData: productData.product, name: req.session.userName, walletAmount })
        } else {
            const wishlist = new Wishlist({
                product: [],
                userId: userId
            })
            await wishlist.save()
                .then(() => {
                    res.render('wishlist', { name: req.session.userName, productData: 0, walletAmount })
                })
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For adding products to wishlit
const addToWishlist = async (req, res) => {
    try {
        const productId = req.body.id
        const userId = req.session.userId
        const userData = await Wishlist.findOne({ userId: userId })
        if (!userData && userId) {
            const wishlist = new Wishlist({
                product: [{
                    productId: productId
                }],
                userId: userId
            })
            await wishlist.save()
            res.json({ success: true })
        } else if (userId) {
            const productExist = userData.product.filter(data => { return data.productId.toString() == productId })
            if (productExist.length > 0) {
                res.json({ success: true })
            } else {
                await Wishlist.updateOne({ userId: userId }, { $push: { product: { productId } } })
                res.json({ success: true })
            }
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//For remove product from wishlist
const removeWishlist = async (req, res) => {
    try {
        const productId = req.query.id
        const userId = req.session.userId
        await Wishlist.updateOne({ userId: userId }, { $pull: { product: { productId: productId } } })
            .then(data => {
                res.redirect('/wishlist')
            })
    } catch (error) {
        console.log(error.message)
    }
}

//For view user cart page
const loadCart = async (req, res) => {
    try {
        const code = req.body.code
        const userId = req.session.userId
        const cartData = await Cart.findOne({ userId: userId }).populate("product.productId")
        const coupons = await Coupon.find()
        const walletAmount = req.session.wallet || 0;
        if (cartData) {
            if (cartData.product.length > 0) {
                let totalSalePrice = cartData.product.reduce((acc, cur) => {
                    acc += cur.productId.salePrice * cur.quantity;
                    return acc;
                }, 0);
                if (!code) {
                    res.render('cart', { productData: cartData.product, name: req.session.userName, totalSalePrice, cartData, walletAmount, coupons })
                } else {
                    await Coupon.findOne({ code: { $regex: new RegExp(code, 'i') } })
                        .then((coupon) => {
                            if (coupon.type === "Flat" && coupon.minOrder < totalSalePrice) {
                                totalSalePrice = totalSalePrice - coupon.value
                            } else if (coupon.type === "Percentage" && coupon.minOrder < totalSalePrice) {
                                totalSalePrice = totalSalePrice - ((totalSalePrice * coupon.value) / 100)
                            }
                            res.json({ success: coupon })
                        })
                }
            } else {
                res.render('cart', { name: req.session.userName, productData: '', walletAmount })
            }
        } else {
            const cart = new Cart({
                product: [],
                userId: userId
            })
            await cart.save()
            res.render('cart', { name: req.session.userName, productData: '', walletAmount })
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For add product to cart
const addToCart = async (req, res) => {
    try {
        const productId = req.query.id
        const wishlist = req.query.wishlist
        const userId = req.session.userId
        const quantity = 1;
        const productData = await Products.findOne({ _id: productId })
        const totalSalePrice = productData.salePrice;
        let cartData = await Cart.findOne({ userId: userId })
        if (!cartData) {
            const cart = new Cart({
                product: [],
                userId: userId
            })
            cartData = await cart.save()
        }
        const productExist = cartData.product.find((data) => data.productId.toString() == productId)
        if (productExist) {
            //if the product is also in cart then update quantity
            await Cart.updateOne({ userId: userId, "product.productId": productId },
                { $inc: { "product.$.quantity": 1, "product.$.totalSalePrice": totalSalePrice } })
                .then(async (data) => {
                    if (wishlist) {
                        await Wishlist.updateOne({ userId: userId }, { $pull: { product: { productId: productId } } })
                    }
                    res.redirect('/cart')
                })

        } else {
            await Cart.updateOne({ userId: userId }, { $push: { product: { productId, quantity, totalSalePrice } } })
                .then(async (data) => {
                    if (wishlist) {
                        await Wishlist.updateOne({ userId: userId }, { $pull: { product: { productId: productId } } })
                    }
                    res.redirect('/cart')
                })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For removing product from cart
const removeProduct = async (req, res) => {
    try {
        const productId = req.query.id
        const cartData = await Cart.findOne({ userId: req.session.userId });
        if (cartData) {
            await Cart.updateOne({ userId: req.session.userId }, { $pull: { product: { productId: productId } } })
                .then(data => {
                    res.redirect('/cart')
                })
            //const setQuantity = await Products.updateOne({ _id: productId }, { $set: { cartQuantity: 1 } })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For checkout product
const productCheckout = async (req, res) => {
    try {
        const code = req.body.couponCode
        const cartData = await Cart.findOne({ userId: req.session.userId }).populate("product.productId").populate("product.couponId")
        const walletAmount = req.session.wallet || 0;
        if (cartData) {
            const userData = await User.findOne({ _id: req.session.userId })
            let totalSalePrice = cartData.product.reduce((acc, cur) => {
                acc += cur.productId.salePrice * cur.quantity;
                return acc;
            }, 0);
            if (code) {
                await Coupon.findOne({ code: { $regex: new RegExp(code, 'i') } })
                    .then((coupon) => {
                        if (coupon.type === "Flat" && coupon.minOrder < totalSalePrice) {
                            totalSalePrice = totalSalePrice - coupon.value
                        } else if (coupon.type === "Percentage" && coupon.minOrder < totalSalePrice) {
                            totalSalePrice = totalSalePrice - ((totalSalePrice * coupon.value) / 100)
                        }
                    })
            }
            res.render('checkout', { totalSalePrice, addressData: userData.address, name: req.session.userName, code, walletAmount })
        } else {
            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For selecting payment methods
const productPayment = async (req, res) => {
    try {
        const { selectedAddress, couponCode } = req.body
        const walletAmount = req.session.wallet || 0;
        let totalSalePrice;
        if (selectedAddress) {
            const cartData = await Cart.findOne({ userId: req.session.userId }).populate("product.productId").populate("product.couponId")
            totalSalePrice = cartData.product.reduce((acc, cur) => {
                acc += cur.productId.salePrice * cur.quantity;
                return acc;
            }, 0);
            if (couponCode) {
                await Coupon.findOne({ code: { $regex: new RegExp(couponCode, 'i') } })
                    .then((coupon) => {
                        if (coupon.type === "Flat" && coupon.minOrder < totalSalePrice) {
                            totalSalePrice = totalSalePrice - coupon.value
                        } else if (coupon.type === "Percentage" && coupon.minOrder < totalSalePrice) {
                            totalSalePrice = totalSalePrice - ((totalSalePrice * coupon.value) / 100)
                        }
                    })
            }
            const allAddress = await User.findOne({ _id: req.session.userId }, { address: 1, _id: 0 })
            const addressData = allAddress.address.find(obj => obj._id.toString() === selectedAddress);
            res.render('payment', { totalSalePrice, addressData, name: req.session.userName, couponCode, walletAmount })
        } else {
            const addressData = await User.findOne({ _id: req.session.userId })
            res.render('checkout', { info: "Select Address", addressData: addressData.address, totalSalePrice, name: req.session.userName, walletAmount });
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}


//For changing and updating quantity and total price of cart products
const changeQuantity = async (req, res) => {
    try {
        const { userData, productId, quantity, salePrice } = req.body;
        const cartData = await Cart.findOne({ userId: userData }).populate("product.productId")
        const product = cartData.product.find(item => item.productId._id == productId);
        const afterQuantity = product.quantity + Number(quantity);
        const AddSalePrice = product.totalSalePrice + Number(salePrice)
        const MinusSalePrice = product.totalSalePrice - Number(salePrice)
        if (afterQuantity != 0 && afterQuantity <= product.productId.quantity) {
            await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId },
                { $inc: { 'product.$.quantity': quantity } })
            if (quantity == 1) {
                await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId },
                    { $set: { "product.$.totalSalePrice": AddSalePrice } })
                res.json({ success: true })
            } else {
                await Cart.findOneAndUpdate({ userId: userData, 'product.productId': productId },
                    { $set: { "product.$.totalSalePrice": MinusSalePrice } })
                res.json({ success: false })
            }
        } else {
            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadWishlist,
    addToWishlist,
    removeWishlist,

    loadCart,
    addToCart,
    removeProduct,

    productCheckout,
    productPayment,
    changeQuantity,

}