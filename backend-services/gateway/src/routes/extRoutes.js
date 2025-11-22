const express = require("express");
const router = express.Router();

const { getPhishingDomains } = require("../controllers/microController");

router.get("/phishing", getPhishingDomains);

module.exports = router;

