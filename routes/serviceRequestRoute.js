const express = require("express");
const {
  getRequestMembership,
  getAllServiceRequests,
} = require("../controllers/serviceRequestController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.get("/membership-request", getRequestMembership);
router.get("/all-service-requests/:userId", getAllServiceRequests);

module.exports = router;
