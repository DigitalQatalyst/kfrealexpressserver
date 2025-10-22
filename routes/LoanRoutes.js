const express = require("express");
const {
  CancelLoan,
  getCancelLoans,
} = require("../controllers/CancelLoanController");
const { DisburseLoan } = require("../controllers/DisburseLoanController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/cancel-loan", CancelLoan);
router.post("/disburse-loan", DisburseLoan);
router.get("/get-cancel-loans", getCancelLoans);

module.exports = router;
