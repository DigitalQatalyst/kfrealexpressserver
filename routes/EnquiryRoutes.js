const express = require("express");
const { CreateEnquiry } = require("../controllers/EnquiryController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-enquiry",CreateEnquiry)

module.exports = router;