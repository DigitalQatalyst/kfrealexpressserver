const express = require("express");
const {
  BookConsultation,
  getBookConsultation,
} = require("../controllers/ConsultationController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/book-consultation", BookConsultation);
router.get("/get-book-consultation", getBookConsultation);

module.exports = router;
