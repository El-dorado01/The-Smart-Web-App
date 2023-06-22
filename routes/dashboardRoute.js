const express = require('express');

const router = express.Router()
const dashboard = require("../controllers/dashboard/index")
const { lockscreen } = require("../controllers/dashboard/lockscreen")




router.route("/").get(dashboard)
router.route("/index").get(dashboard)
router.route("/lockscreen").get(lockscreen)

module.exports = router