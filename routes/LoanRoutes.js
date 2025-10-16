const express = require("express");
const {
  CancelLoan,
  GetCancelLoans,
} = require("../controllers/CancelLoanController");
const { DisburseLoan } = require("../controllers/DisburseLoanController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/cancel-loan", CancelLoan);
router.post("/disburse-loan", DisburseLoan);
router.post("/get-cancel-loans", GetCancelLoans);

module.exports = router;
