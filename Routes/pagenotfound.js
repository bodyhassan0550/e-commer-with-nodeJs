const express = require("express");
const path = require("path");
const errorControl = require("../controllers/404")
const router = express.Router();
router.use(errorControl.error);
module.exports = router;
