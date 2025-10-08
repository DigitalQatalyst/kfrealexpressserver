const express = require("express");

const { HandleContactUs } = require("../controllers/ContactUsController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/contact-us", HandleContactUs);

module.exports = router;
