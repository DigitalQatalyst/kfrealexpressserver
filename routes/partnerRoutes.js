const express = require("express");
const { BookConsultation } = require("../controllers/ConsultationController");
const { CreatePartnerShip } = require("../controllers/PartnerController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-partnership",CreatePartnerShip)

module.exports = router;