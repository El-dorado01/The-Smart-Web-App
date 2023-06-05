const express = require('express');

const router = express.Router()

const {registerForm, registerUser} = require("../controllers/auth/register")
const {login, loginUser} = require("../controllers/auth/login")

router.route("/register").get(registerForm).post(registerUser)
router.route("/login").get(login).post(loginUser)

module.exports = router