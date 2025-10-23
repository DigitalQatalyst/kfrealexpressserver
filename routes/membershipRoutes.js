const express = require("express");

const { CreateTraining } = require("../controllers/TrainingController");
const {
  RequestMembership,
  getRequestMembership,
} = require("../controllers/MembershipController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/request-membership", RequestMembership);
router.get("/get-request-for-membership", getRequestMembership);

module.exports = router;
