const express = require("express");

const {
  RequestFunding,
  getFundingRequests,
} = require("../controllers/RequestFunding");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/requestfunding", RequestFunding);
router.get("/get-funding-requests", getFundingRequests);

module.exports = router;
