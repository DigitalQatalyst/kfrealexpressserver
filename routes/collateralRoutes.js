const express = require("express");
const { BookConsultation } = require("../controllers/ConsultationController");
const { CreatePartnerShip } = require("../controllers/PartnerController");
const {
  CreateCollateralUserGuide,
  getCollateralForms,
} = require("../controllers/CollateralController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-collateraluserguide", CreateCollateralUserGuide);
router.get("/get-collateral-forms", getCollateralForms);

module.exports = router;
