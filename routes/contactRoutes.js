const express = require("express");

const {
  CreateContact,
  getStakeholderCommunications,
} = require("../controllers/ContactUsController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/contact-us", CreateContact);
router.get("/get-stakeholder-communications", getStakeholderCommunications);

module.exports = router;
