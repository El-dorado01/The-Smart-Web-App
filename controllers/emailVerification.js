const AuthModel = require("../models/AuthModel")

require("express-async-errors")
const { StatusCodes } = require("http-status-codes")

const emailVerificationPage = (req, res) => {
    const email = req.params.email
    res.status(StatusCodes.OK).render("./emailVerification", { email: `${email}`})
}

const verifyEmail = async (req, res) => {
    const userId = req.params.userId
    const key = req.query.keyValue

    const fetchUser = await AuthModel.findById(userId)

    if(!fetchUser){
        res.send("Verification failed")
    }else{
        if(fetchUser.key === key){
            const updateVerification = await AuthModel.findByIdAndUpdate(userId, { verificationStatus: true })
            if(updateVerification)
            res.send("Verification successful")
        }else{
            res.send("Link may be broken, please try clicking directly from your email")
        }
    }
    // res.status(StatusCodes.OK).render("./emailVerification", { verificationStatus: "" })
}

module.exports = {
    emailVerificationPage,
    verifyEmail
}