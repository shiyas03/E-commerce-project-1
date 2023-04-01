const Products = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brands = require('../models/brandModel');
const { Identity } = require('twilio/lib/twiml/VoiceResponse');
const crypto = require('crypto')

const sharp = require('sharp')
const path = require('path');
const imagesDir = path.join(__dirname, '..', 'public', 'images');
const fs = require('fs')

function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

//Get Products 
const loadProducts = async (req, res) => {
    try {
        const value = req.query.value
        const productData = await Products.find().populate('category').populate('brand')
        if (productData) {
            res.render('products-list', { productData, value })
        } else {
            res.render('products-list')
        }

    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//Get Add product form
const loadAddForm = async (req, res) => {
    try {
        const randomString = generateRandomString(12);
        const categoryData = await Category.find({}, { name: 1 })
        const brandData = await Brands.find({}, { name: 1 })
        res.render('add-products', { categoryData, brandData, randomString })
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For upload Add Products
const uploadProduct = async (req, res) => {
    try {
        const { productName, skuCode, brand, category, gender, price, salePrice, quantity, status, description } = req.body;
        if (!productName.trim() || !skuCode.trim() || isNaN(price) || isNaN(quantity) ||
            !description.trim() || !brand || !category || !status || !gender || !req.files) {
            const randomString = generateRandomString(12);
            const categoryData = await Category.find({}, { name: 1 })
            const brandData = await Brands.find({}, { name: 1 })
            const enteredData = req.body
            res.render('add-products', { nameField: "Check All Fields Properly", categoryData, brandData, enteredData, randomString })
        } else {
            const products = new Products({
                productName: productName,
                skuCode: skuCode,
                brand: brand,
                category: category,
                gender: gender,
                price: price,
                salePrice: salePrice,
                quantity: quantity,
                status: status,
                description: description,
            })
            const productSave = await products.save()
            if (productSave) {
                for (let i = 0; i < req.files.length; i++) {
                    const imagesUpload = req.files[i].filename
                    const originalPath = req.files[i].path
                    const extension = imagesUpload.split('.').pop()
                    const resizedFilename = `${imagesUpload}_resized.${extension}`
                    const resizedPath = `public/images/${resizedFilename}`

                    // Use sharp to resize and crop the image to 200x100 pixels
                    sharp(originalPath)
                        .resize(550, 650)
                        .toFile(resizedPath, (err, info) => {
                            if (err) {
                                console.log(err)
                            } else {
                                fs.unlink(originalPath, (err) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                })
                            }
                        })
                    // Use await to ensure the update is completed before redirecting
                    await Products.findOneAndUpdate({ _id: productSave._id }, { $push: { images: resizedFilename } })
                }
            }
            res.redirect('/admin/products-list')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For change status of product
const changeStatusProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const status = req.query.status
        await Products.findOne({ _id: id }).populate('category')
            .then(async (data) => {
                await Products.updateOne({ _id: id }, { status: status })
                res.redirect('/admin/products-list')
            })
    } catch (error) {
        console.log(error.message);
    }
}

//For edit products
const editProduct = async (req, res) => {
    try {
        req.session.query = req.query.id
        const productData = await Products.findOne({ _id: req.query.id }).populate('brand').populate('category')
        const categoryData = await Category.find();
        const brandData = await Brands.find();
        const images = productData.images;
        res.render('edit-product', { productData, categoryData, brandData, images })
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For update product
const updateProduct = async (req, res) => {
    try {
        const { productName, skuCode, brand, category, gender, price, salePrice, quantity, status, description } = req.body;
        if (!productName.trim() || !skuCode.trim() || !price.trim() || isNaN(price) || isNaN(quantity)
            || !description.trim() || !brand || !category || !status || !gender) {
            const categoryData = await Category.find({}, { name: 1 })
            const brandData = await Brands.find({}, { name: 1 })
            const productData = await Products.findOne({ _id: req.body.id })
            const images = productData.images;
            res.render('edit-product', { fieldError: "Some fields are empty", categoryData, brandData, productData, images })
        } else {
            for (let i = 0; i < req.files.length; i++) {
                const imagesUpload = req.files[i].filename
                const originalPath = req.files[i].path
                const extension = imagesUpload.split('.').pop()
                const resizedFilename = `${imagesUpload}_resized.${extension}`
                const resizedPath = `public/images/${resizedFilename}`

                // Use sharp to resize and crop the image to 200x100 pixels
                sharp(originalPath)
                    .resize(550, 650)
                    .toFile(resizedPath, (err, info) => {
                        if (err) {
                            console.log(err)
                        } else {
                            fs.unlink(originalPath, (err) => {
                                if (err) {
                                    console.log(err)
                                }
                            })
                        }
                    })

                // Use await to ensure the update is completed
                await Products.updateOne({ _id: req.body.id }, { $push: { images: resizedFilename } })
            }
            const updateData = await Products.findByIdAndUpdate({ _id: req.body.id }, {
                $set: {
                    productName: productName, skuCode: skuCode,
                    brand: brand, category: category, gender: gender, price: price, salePrice: salePrice,
                    quantity: quantity, status: status, description: description
                }
            })
            if (updateData) {
                res.redirect('/admin/products-list')
                //res.redirect('/admin/edit-product/?id='+req.session.query);
                delete req.session.query
            } else {
                console.log(error.message);
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For delete image from product edit form
const imageDelete = async (req, res) => {
    try {
        const id = req.query.id;
        const imageData = await Products.updateOne({ images: id }, { $pull: { images: { $in: [id] } } })
        if (imageData) {
            const imagePath = path.join(imagesDir, id);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            } else {
                console.log(`Image ${id} not found`);
            }
            res.redirect('/admin/edit-product/?id=' + req.session.query);
            delete req.session.query;
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For search products in list
const searchProduct = async (req, res) => {
    try {
        const value = req.query.value
        const productData = await Products.find({ productName: { $regex: req.body.search } });
        if (productData == "") {
            res.redirect('/admin/products-list')
        } else {
            res.render('products-list', { productData, value })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For view Product
const viewProduct = async (req, res) => {
    try {
        res.render('view-product')
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For get category list
const loadCategory = async (req, res) => {
    try {
        const categoryData = await Category.find();
        if (categoryData) {
            res.render('category-list', { categoryData })
        }
        else {
            res.redirect('/admin/add-category')
        }
    } catch (error) {
        console.log(error.message);
        res.render('404')
    }
}

//For get add category page
const loadAddCategory = async (req, res) => {
    try {
        res.render('add-category')
    } catch (error) {
        console.log(error.message);
    }
}

//For upload category into db
const uploadCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        const nameFind = await Category.findOne({ name: { $regex: new RegExp(categoryName, 'i') } })
        if (nameFind) {
            res.render('add-category', { nameError: "Category already Exist" });
        } else {
            let category = new Category({
                name: req.body.categoryName,
                gender: req.body.gender,
                description: req.body.description,
                image: req.file.filename,
                status: "Active"
            })
            const categoryData = await category.save()
            if (categoryData) {
                res.redirect('/admin/category-list')
            } else {
                res.redirect()
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

//For delete product
const changeStatusCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const status = req.query.status
        if (status === "Active") {
            await Products.updateMany({ category: id }, { $set: { status: "Available" } })
            res.redirect('/admin/category-list')
        } else {
            await Products.updateMany({ category: id }, { $set: { status: "Not Available" } })
            res.redirect('/admin/category-list')
        }
    } catch (error) {
        console.log(error.message);
    }

}

//For edit category
const editCategory = async (req, res) => {
    try {
        const categoryData = await Category.findOne({ _id: req.query.id });
        res.render('edit-category', { categoryData });
    } catch (error) {
        console.log(error.message);
    }
}

//For delete category image
const deleteCategoryImage = async (req, res) => {
    try {
        const id = req.query.id
        const imageData = await Category.updateOne({ _id: id }, { $unset: { image: '' } })
        if (imageData) {
            const imagePath = path.join(imagesDir, id);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            } else {
                console.log(`Image ${id} not found`);
            }
            res.redirect('/admin/edit-category/?id=' + id)
        } else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}


//For update category data
const updateCategory = async (req, res) => {
    try {
        const { categoryName, categoryCode, description } = req.body;
        if (!categoryName.trim() || !description.trim()) {
            res.render('edit-category', { fieldError: "Some fields are empty", categoryData: req.body });
        } else {
            if (req.file) {
                const updateData = await Category.findByIdAndUpdate({ _id: req.body.id }, {
                    $set: {
                        name: categoryName, description: description, image: req.file.filename
                    }
                })
                res.redirect('/admin/category-list');
            } else {
                const updateData = await Category.findByIdAndUpdate({ _id: req.body.id }, {
                    $set: {
                        name: categoryName, description: description
                    }
                })
                res.redirect('/admin/category-list');
            }

        }
    } catch (error) {
        console.log(error.message);
    }

}

//For get brands list
const loadBrands = async (req, res) => {
    try {
        const brandsData = await Brands.find()
        if (brandsData) {
            res.render('brands-list', { brandsData });
        } else {
            res.render('brands-list');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For get add brands page
const loadAddBrand = async (req, res) => {
    try {
        res.render('add-brands')
    } catch (error) {
        console.log(error.message);
    }
}

//For upload brands into db
const uploadBrand = async (req, res) => {
    try {
        const brands = new Brands({
            name: req.body.brandName,
            description: req.body.description,
            image: req.file.filename
        })
        const brandsData = await brands.save()
        if (brandsData) {
            res.redirect('/admin/brands-list')
        } else {
            res.redirect('/admin/add-brands')
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For delete product
const deleteBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const data = await Brands.deleteOne({ _id: id })
        if (data) {
            res.redirect('/admin/brands-list')
        } else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

//For edit Brand
const editBrand = async (req, res) => {
    try {
        const brandData = await Brands.findOne({ _id: req.query.id });
        res.render('edit-brand', { brandData })
    } catch (error) {
        console.log(error.message);
    }
}

//For update Brand
const updateBrand = async (req, res) => {
    try {
        const { brandName, description } = req.body;
        if (!brandName.trim() || !description.trim()) {
            const brandData = await Brands.findOne({ _id: req.body.id });
            res.render('edit-brand', { fieldError: 'Some fields are empty', brandData });
        } else {
            if (req.file) {
                const updateData = await Brands.findByIdAndUpdate({ _id: req.body.id }, {
                    $set: { name: brandName, description: description, image: req.file.filename }
                });
                res.redirect('/admin/brands-list')
            } else {
                const updateData = await Brands.findByIdAndUpdate({ _id: req.body.id }, {
                    $set: { name: brandName, description: description }
                });
                res.redirect('/admin/brands-list')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

//For delete Brand image
const deleteBrandImage = async (req, res) => {
    try {
        const id = req.query.id
        const imageData = await Brands.updateOne({ _id: id }, { $unset: { image: '' } })
        const imagePath = path.join(imagesDir, id);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        } else {
            console.log(`Image ${id} not found`);
        }
        res.redirect('/admin/edit-brand/?id=' + id);
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProducts,
    loadAddForm,
    changeStatusProduct,
    uploadProduct,
    editProduct,
    updateProduct,
    imageDelete,
    searchProduct,
    viewProduct,

    loadCategory,
    loadAddCategory,
    uploadCategory,
    changeStatusCategory,
    deleteCategoryImage,
    editCategory,
    updateCategory,

    loadBrands,
    loadAddBrand,
    uploadBrand,
    deleteBrand,
    editBrand,
    deleteBrandImage,
    updateBrand
} 