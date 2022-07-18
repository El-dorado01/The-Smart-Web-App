const path = require('path');

require("express-async-errors")
// const AuthModel = require("../../models/AuthModel")
const asyncWrapper = require("../../middleware/async")
const { 
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError
} = require("../../errors")


const lockscreen = (req, res) => {
    res.render("./dashboard/lockscreen", {headTitle: "Lockscreen"})
}

module.exports = {
    lockscreen
}