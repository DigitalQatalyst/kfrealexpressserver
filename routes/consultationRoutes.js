const express = require("express");
const { BookConsultation } = require("../controllers/ConsultationController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/book-consultation",BookConsultation)

module.exports = router;