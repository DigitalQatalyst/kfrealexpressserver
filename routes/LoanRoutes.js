const express = require("express");
const {
  CancelLoan,
  getCancelLoans,
} = require("../controllers/CancelLoanController");
const {
  DisburseLoan,
  getDisbursedLoans,
  getReallocationofLoanDisbursement,
} = require("../controllers/DisburseLoanController");
const {
  getAmendExistingLoan,
} = require("../controllers/AmendExistingLoanController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/cancel-loan", CancelLoan);
router.post("/disburse-loan", DisburseLoan);
router.get("/get-cancel-loans/:id", getCancelLoans);
router.get("/get-amend-existing-loan", getAmendExistingLoan);
router.get("/get-disbursed-loans", getDisbursedLoans);
router.get(
  "/get-reallocation-of-loan-disbursement",
  getReallocationofLoanDisbursement
);

module.exports = router;
