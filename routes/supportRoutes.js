const express = require("express");

const {
  CreateSupportRequest,
  getIssueSupportLetter,
} = require("../controllers/SupportController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-support-request", CreateSupportRequest);
router.get("/get-issue-support-letter", getIssueSupportLetter);

module.exports = router;
