const Cart = require('../models/cartModel')
const Orders = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Wallet = require('../models/walletModel')
const Products = require('../models/productModel')
const crypto = require('crypto')

const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//For place order
const placeOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod, code } = req.body;
        const cartData = await Cart.findOne({ userId: req.session.userId }).populate("product.productId");
        const productIds = cartData.product.map(data => data.productId._id);
        const quantity = cartData.product.map(data => data.quantity);
        let totalSalePrice = cartData.product.map(data => data.totalSalePrice);
        const orderedDate = new Date(Date.now());
        const deliveryDate = new Date(orderedDate.getTime()); // create a copy of the orderedDate object
        deliveryDate.setDate(deliveryDate.getDate() + 7)
        //checking order collection heve or not
        await Orders.findOne({ userId: req.session.userId })
            .then(async (data) => {
                if (!data) {
                    const orders = new Orders({
                        orderDetails: [],
                        userId: req.session.userId,
                    });
                    await orders.save()
                }
            })
        if (code) {
            //Applying coupon
            await Coupon.findOne({ code: { $regex: new RegExp(code, 'i') } })
                .then(async (coupon) => {
                    const value = coupon.value / cartData.product.length
                    if (coupon.type === "Flat") {
                        totalSalePrice = totalSalePrice.map(data => {
                            return data - value
                        })
                    } else if (coupon.type === "Percentage") {
                        totalSalePrice = totalSalePrice.map(data => {
                            return data - ((data * value) / 100)
                        })
                    }
                    await Coupon.updateOne({ _id: coupon._id }, { $inc: { quantity: -1 } })
                })
            await Coupon.updateOne({ quantity: 0 }, { $set: { status: "Expired" } })
        }
        let billAmount = 0;
        for (let i = 0; i < productIds.length; i++) {
            billAmount += totalSalePrice[i]
        }
        if (!paymentMethod) {
            res.json({ message: 'Please select payment option' })
        } else if (paymentMethod == 'Wallet') {
            const walletAmount = req.session.wallet || 0;
            if (walletAmount < billAmount) {
                res.json({ message: "Not enough money in your wallet" })
            } else {
                for (let i = 0; i < productIds.length; i++) {
                    await Orders.updateOne({ userId: req.session.userId }, {
                        $push: {
                            orderDetails: {
                                productId: productIds[i],
                                userId: req.session.userId,
                                orderedQuantity: quantity[i],
                                totalSalePrice: totalSalePrice[i],
                                addressId: addressId,
                                status: "Placed",
                                paymentMethod: paymentMethod,
                                paymentStatus: "Paid",
                                orderedDate: orderedDate,
                                deliveryDate: deliveryDate
                            }
                        }
                    })
                }
                await Wallet.updateOne({ userId: req.session.userId }, { $inc: { amount: -billAmount } })
                res.json({ success: true })
                productIds.forEach(async (data, i) => {
                    await Products.updateOne({ _id: data }, { $inc: { quantity: -(quantity[i]) } })
                })
                await Cart.updateOne({ userId: req.session.userId }, { $unset: { product: '' } })
            }
        } else if (paymentMethod == 'razorPay') {
            function generateRandomString(length) {
                return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
            }
            const randomString = generateRandomString(24);
            instance.orders.create({
                amount: parseInt(billAmount) * 100,
                currency: "INR",
                receipt: randomString
            }).then(order => {
                res.json({ order: order })
            })
        } else {
            for (let i = 0; i < productIds.length; i++) {
                await Orders.updateOne({ userId: req.session.userId }, {
                    $push: {
                        orderDetails: {
                            productId: productIds[i],
                            userId: req.session.userId,
                            orderedQuantity: quantity[i],
                            totalSalePrice: totalSalePrice[i],
                            addressId: addressId,
                            status: "Placed",
                            paymentMethod: paymentMethod,
                            paymentStatus: "Pending",
                            orderedDate: orderedDate,
                            deliveryDate: deliveryDate
                        }
                    }
                })
            }
            res.json({ success: true })
            productIds.forEach(async (data, i) => {
                await Products.updateOne({ _id: data }, { $inc: { quantity: -(quantity[i]) } })
            })
            await Cart.updateOne({ userId: req.session.userId }, { $unset: { product: '' } })
        }
        await Products.updateMany({ quantity: 0 }, { $set: { status: "Not Available" } })
    } catch (error) {
        console.log(error.message);
    }
}


//For verify razorpay payment
const verifyPayment = async (req, res, next) => {
    try {
        const { order, payment } = req.body;
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest("hex")
        if (hmac == payment.razorpay_signature) {
            await Orders.updateOne({ _id: order.receipt }, {
                $set: {
                    paymentStatus: 'Paid'
                }
            })
            res.json({ success: true })
        } else {
            await Orders.updateOne({ _id: order.receipt }, {
                $set: {
                    paymentStatus: 'Failed'
                }
            })
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//For confirm and update order database
const orderConfirm = async (req, res) => {
    try {
        const { addressId, payment, code } = req.body;
        const cartData = await Cart.findOne({ userId: req.session.userId }).populate("product.productId");
        const quantity = cartData.product.map(data => data.quantity);
        const productIds = cartData.product.map(data => data.productId._id);
        let totalSalePrice = cartData.product.map(data => data.totalSalePrice);
        const orderedDate = new Date(Date.now());
        const deliveryDate = new Date(orderedDate.getTime()); // create a copy of the orderedDate object
        deliveryDate.setDate(deliveryDate.getDate() + 7)
        if (code) {
            await Coupon.findOne({ code: { $regex: new RegExp(code, 'i') } })
                .then(async (coupon) => {
                    const value = coupon.value / cartData.product.length
                    if (coupon.type === "Flat") {
                        totalSalePrice = totalSalePrice.map(data => {
                            return data - value
                        })
                    } else if (coupon.type === "Percentage") {
                        totalSalePrice = totalSalePrice.map(data => {
                            return data - ((data * value) / 100)
                        })
                    }
                    await Coupon.updateOne({ _id: coupon._id }, { $inc: { quantity: -1 } })
                })
            await Coupon.updateOne({ quantity: 0 }, { $set: { status: "Expired" } })
        }

        for (let i = 0; i < productIds.length; i++) {
            await Orders.updateOne({ userId: req.session.userId }, {
                $push: {
                    orderDetails: {
                        productId: productIds[i],
                        userId: req.session.userId,
                        orderedQuantity: quantity[i],
                        totalSalePrice: totalSalePrice[i],
                        addressId: addressId,
                        status: "Placed",
                        paymentMethod: payment,
                        paymentStatus: "Paid",
                        orderedDate: orderedDate,
                        deliveryDate: deliveryDate
                    }
                }
            })
        }
        res.json({ success: true })
        productIds.forEach(async (data, i) => {
            await Products.updateOne({ _id: data }, { $inc: { quantity: -(quantity[i]) } })
        })
        await Cart.updateOne({ userId: req.session.userId }, { $unset: { product: '' } })
        await Products.updateMany({ quantity: 0 }, { $set: { status: "Not Available" } })
    } catch (error) {
        console.log(error.message)
    }
}

//For user orders list
const userOrders = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({userId : req.session.userId })
        req.session.wallet = wallet.amount
        const walletAmount = req.session.wallet
        const ordersData = await Orders.findOne({ userId: req.session.userId }).populate("orderDetails").populate("orderDetails.productId").populate("orderDetails.addressId")
        if (ordersData) {
            const { orderDetails } = ordersData
            //formating date and creating delivery date
            const dates = orderDetails.map(data => {
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                const orderDate = data.orderedDate ? new Date(data.orderedDate).toLocaleString('en-GB', options) : "";
                const deliverydate = data.deliveryDate ? new Date(data.deliveryDate).toLocaleString('en-GB', options) : "";
                return { originalDate: orderDate, newDate: deliverydate };
            });         
            //const productsData = await Products.find({ _id: { $in: productsId } }).populate('brand')
            res.render('user-orders', { name: req.session.userName, dates, ordersData: orderDetails.reverse(), walletAmount })
        } else {
            const orders = new Orders({
                orderDetails: [],
                userId: req.session.userId,
            })
            await orders.save()
                .then(() => {
                    res.render('user-orders', { ordersData: 0, name: req.session.userName, walletAmount })
                })
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For cancel orders 
const orderCancel = async (req, res) => {
    try {
        const orderId = req.query.id
        if (orderId) {
            await Orders.findOneAndUpdate({ userId: req.session.userId, "orderDetails._id": orderId },
                { $set: { "orderDetails.$.status": 'Cancelled' } })
                .then(async (data) => {
                    const price = data.orderDetails.filter(data => data._id.toString() === orderId && data.paymentStatus === 'Paid').map(data => data.totalSalePrice)
                    if (price.length !== 0) {
                        await Wallet.updateOne({ userId: req.session.userId }, { $inc: { amount: price[0] } })
                        await Orders.findOneAndUpdate({ userId: req.session.userId, "orderDetails._id": orderId }, { $set: { "orderDetails.$.paymentStatus": 'Refunded' } })
                    }
                    res.redirect('/orders')
                })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For order return
const returnOrder = async (req, res) => {
    try {
        const orderId = req.query.id
        if (orderId) {
            await Orders.findOneAndUpdate({ userId: req.session.userId, "orderDetails._id": orderId },
                { $set: { "orderDetails.$.return": false, "orderDetails.$.status": 'Returning' } })
            res.redirect('/orders')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//For confirm return in admin side
const returnConfirm = async (req, res) => {
    try {
        const orderId = req.query.id
        if (orderId) {
            await Orders.findOneAndUpdate({ userId: req.session.userId, "orderDetails._id": orderId },
                { $set: { "orderDetails.$.return": true, "orderDetails.$.status": 'Returned' } })
                .then(async (data) => {
                    const price = data.orderDetails.filter(data => data._id.toString() === orderId && data.paymentStatus === 'Paid').map(data => data.totalSalePrice)
                    if (price.length !== 0) {
                        await Wallet.updateOne({ userId: req.session.userId }, { $inc: { amount: price[0] } })
                    }
                    res.redirect('/adimin/orders-list')
                })
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    placeOrder,
    verifyPayment,
    orderConfirm,
    userOrders,
    orderCancel,
    returnOrder,
    returnConfirm,
}