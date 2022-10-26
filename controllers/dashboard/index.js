const path = require('path');

require("express-async-errors")
// const AuthModel = require("../../models/AuthModel")
const asyncWrapper = require("../../middleware/async")
const { 
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError
} = require("../../errors")


const dashboard = (req, res) => {
    res.render("./dashboard/index", {headTitle: "Dashboard"})
}

module.exports = dashboard