const express = require("express");
const {
  CancelLoan,
  getCancelLoans,
} = require("../controllers/CancelLoanController");
const { DisburseLoan, getDisbursedLoans } = require("../controllers/DisburseLoanController");
const {
  getAmendExistingLoan,
} = require("../controllers/AmendExistingLoanController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/cancel-loan", CancelLoan);
router.post("/disburse-loan", DisburseLoan);
router.get("/get-cancel-loans", getCancelLoans);
router.get("/get-amend-existing-loan", getAmendExistingLoan);
router.get("/get-disbursed-loans", getDisbursedLoans);

module.exports = router;
