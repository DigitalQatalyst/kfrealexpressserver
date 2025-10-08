const express = require("express");

const { CreateTraining } = require("../controllers/TrainingController");
const { RequestMembership } = require("../controllers/MembershipController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/request-membership", RequestMembership);

module.exports = router;
