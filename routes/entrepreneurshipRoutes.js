const express = require("express");

const {
  CreateEntrepreneurshipTraining,
} = require("../controllers/EntrepreneurshipTraining");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/entrepreneurshiptraining", CreateEntrepreneurshipTraining);

module.exports = router;
