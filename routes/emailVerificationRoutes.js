const express = require('express');

const router = express.Router()

const {
    emailVerificationPage,
    verifyEmail
} = require("../controllers/emailVerification")


router.route("/send_email/:email").get(emailVerificationPage)
router.route("/verify_email/:userId/key?:keyValue").get(verifyEmail)

module.exports = router