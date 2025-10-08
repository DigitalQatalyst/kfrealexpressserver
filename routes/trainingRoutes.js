const express = require("express");

const { CreateTraining } = require("../controllers/TrainingController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/entrepreneurshiptraining", CreateTraining);

module.exports = router;
