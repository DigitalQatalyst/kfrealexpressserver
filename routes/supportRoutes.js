const express = require("express");

const { CreateSupportRequest } = require("../controllers/SupportController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-support-request", CreateSupportRequest);

module.exports = router;
