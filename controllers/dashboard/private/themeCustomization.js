const path = require('path');
const jwt = require("jsonwebtoken")
const AuthModel = require("../../../models/AuthModel")

require("express-async-errors")
// const AuthModel = require("../../models/AuthModel")
const asyncWrapper = require("../../../middleware/async")
const { 
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError
} = require("../../../errors")

const colorTheme = asyncWrapper(async (req, res) => {
    const { colorTheme } = req.body

    const cookies = req.cookies
    const token = cookies.jwtAccessToken
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

    req.user = {
        userId: payload.userId,
        userName: payload.userName
    }

    const updateColor = await AuthModel.updateOne(
    {_id: req.user.userId}, 
    {$set: {'themeCustomization.colorTheme': colorTheme}}
    )
})

const fontSize = asyncWrapper(async (req, res) => {
    const { fontSize } = req.body

    const cookies = req.cookies
    const token = cookies.jwtAccessToken
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

    req.user = {
        userId: payload.userId,
        userName: payload.userName
    }

    const updateFontSize = await AuthModel.updateOne(
    {_id: req.user.userId}, 
    {$set: {'themeCustomization.fontSize': fontSize}}
    )
})

const background = asyncWrapper(async (req, res) => {
    const { background } = req.body

    const cookies = req.cookies
    const token = cookies.jwtAccessToken
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY)

    req.user = {
        userId: payload.userId,
        userName: payload.userName
    }

    const updateBackground = await AuthModel.updateOne(
    {_id: req.user.userId}, 
    {$set: {'themeCustomization.background': background}}
    )
})

module.exports = {
    colorTheme,
    fontSize,
    background
}