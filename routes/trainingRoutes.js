const express = require("express");

const {
  CreateTraining,
  getTrainingEntreprenuerships,
} = require("../controllers/TrainingController");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/entrepreneurshiptraining", CreateTraining);
router.get("/get-training-entrepreneurships", getTrainingEntreprenuerships);

module.exports = router;
