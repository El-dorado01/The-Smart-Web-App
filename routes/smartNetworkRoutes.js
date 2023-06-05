const express = require('express');
const router = express.Router()

const fileUploadController = require("../controllers/fileUpload")

router.route("/").post(fileUploadController);

module.exports = router
