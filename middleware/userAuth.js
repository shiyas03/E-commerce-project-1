const isLogin = async(req,res,next)=>{
    try {
        if (req.session.userToken) {
            next();
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.userToken) {
            res.redirect('/');
        }else{
            next();
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isUser = async(req,res,next)=>{
    try {
        if(req.session.userId){
            next();
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin,
    isLogout,
    isUser,
}