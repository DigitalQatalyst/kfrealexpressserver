const express = require("express");
const {
  getToken,
  getAccountProfile,
  getContactInformation,
  crmSignUp,
  getUserProfile,
} = require("../controllers/AuthController");
const { onBoarding } = require("../controllers/OnboardingController");
const { CreateAccount } = require("../controllers/SignUpController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/get-token", getToken);
router.post("/get-account-profile", getAccountProfile);
router.post("/get-contact-info", getContactInformation);
router.post("/onboarding", onBoarding);
router.post("/create-account", CreateAccount);
router.post("/signup", crmSignUp);
router.post("/get-user-profile", getUserProfile);
module.exports = router;
