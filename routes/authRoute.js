const express = require("express");
const {
  getToken,
  getAccountProfile,
  getContactInformation,
  crmSignUp,
  getUserProfile,
  getProfileByCookie,
} = require("../controllers/AuthController");
const { onBoarding } = require("../controllers/OnboardingController");
const {
  CreateAccount,
  getAllProfiles,
} = require("../controllers/SignUpController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/get-token", getToken);
router.post("/get-account-profile", getAccountProfile);
router.post("/get-contact-info", getContactInformation);
router.post("/onboarding", onBoarding);
// router.post("/create-account", CreateAccount);
router.post("/user-signup", CreateAccount);
// router.post("/signup", CreateAccount);
router.post("/get-user-profile", getUserProfile);
// router.get("/get-all-profiles", getAllProfiles);
router.get("/get-kf-profile-cookie/:azureid", getProfileByCookie);

module.exports = router;
