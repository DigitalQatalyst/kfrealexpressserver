const express = require("express");
const { getToken, getAccountProfile, getContactInformation } = require("../controllers/AuthController");
const { onBoarding } = require("../controllers/OnboardingController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/get-token", getToken);
router.post('/get-account-profile',getAccountProfile)
router.post("/get-contact-info",getContactInformation)
router.post("/onboarding",onBoarding)

module.exports = router;