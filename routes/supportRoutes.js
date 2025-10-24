const express = require("express");

const {
  CreateSupportRequest,
  getIssueSupportLetter,
  getSupportRequests,
} = require("../controllers/SupportController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/create-support-request", CreateSupportRequest);
router.get("/get-issue-support-letter", getIssueSupportLetter);
router.get("/get-support-requests", getSupportRequests);

module.exports = router;
