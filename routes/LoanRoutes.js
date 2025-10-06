const express = require("express");
const { CancelLoan } = require("../controllers/CancelLoanController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/cancel-loan", CancelLoan);

module.exports = router;
