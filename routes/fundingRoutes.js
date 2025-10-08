const express = require("express");

const { RequestFunding } = require("../controllers/RequestFunding");

const router = express.Router();
// allow url encoding
router.use(express.urlencoded({ extended: true }));

router.post("/requestfunding", RequestFunding);

module.exports = router;
