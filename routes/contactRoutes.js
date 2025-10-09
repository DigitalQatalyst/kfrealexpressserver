const express = require("express");

const { CreateContact } = require("../controllers/ContactUsController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/contact-us", CreateContact);

module.exports = router;
