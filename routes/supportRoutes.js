const express = require("express");

const {
  CreateSupportRequest,
  getIssueSupportLetter,
  getSupportRequests,
  IssueSupportLetter,
} = require("../controllers/SupportController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-support-request", CreateSupportRequest);
router.get("/get-issue-support-letter", getIssueSupportLetter);
router.get("/get-support-requests", getSupportRequests);
router.post("/issue-support-letter", IssueSupportLetter);

module.exports = router;
