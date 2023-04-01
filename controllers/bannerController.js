const Banner = require('../models/bannerModel')

//For list all banners
const bannerList = async (req, res) => {
    try {
        await Banner.find()
            .then(bannerData => {
                res.render('banners-list', { bannerData })
            })
    } catch (error) {
        console.log(error.message)
        res.render('404')
    }
}

//For add banner
const addBanner = async (req, res) => {
    try {
        res.render('add-banner')
    } catch (error) {
        console.log(error.message)
    }
}

//For upload banner into database
const uploadBanner = async (req, res) => {
    try {
        const { heading, subHeading, buttonText, buttonLink, status } = req.body
        const banner = new Banner({
            heading: heading,
            subHeading: subHeading,
            buttonText: buttonText,
            buttonLink: buttonLink,
            status: status,
            image: req.file.filename
        })
        await banner.save()
        res.redirect('/admin/banners-list')
    } catch (error) {
        console.log(error.message)
        res.render('500')
    }
}

//For edit banner
const editBanner = async (req, res) => {
    try {
        const id = req.query.id
        const bannerData = await Banner.findOne({ _id: id })
        res.render('edit-banner', { bannerData })
    } catch (error) {
        console.log(error.message);
    }
}

const updateBanner = async(req,res)=>{
    try {
        const { heading, subHeading, buttonText, buttonLink, status, id } = req.body
        await Banner.updateOne({_id : id},{
            $set:{
                heading: heading,
                subHeading: subHeading,
                buttonText: buttonText,
                buttonLink: buttonLink,
                status: status,
            }
        })
        if(req.file){
            await Banner.updateOne({_id : id},{
                $set:{
                    image: req.file.filename
                }
            })
        }
        res.redirect('/admin/banners-list')
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

//For delete banner from list
const deleteBanner = async (req, res) => {
    try {
        const id = req.body.id
        await Banner.deleteOne({ _id: id })
        res.json({ response: true })

    } catch (error) {
        log(error.message)
    }
}

module.exports = { 
    bannerList,
    addBanner,
    uploadBanner,
    editBanner,
    updateBanner,
    deleteBanner,
}