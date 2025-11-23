const express = require("express");
const router = express.Router();

const { getPhishingDomains, getCountryCounts } = require("../controllers/microController");

router.get("/phishing", getPhishingDomains);
router.get("/logs/country-counts", getCountryCounts);

module.exports = router;

