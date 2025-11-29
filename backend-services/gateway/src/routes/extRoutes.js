const express = require("express");
const router = express.Router();
const axios = require("axios");

const { getPhishingDomains, getCountryCounts } = require("../controllers/microController");

router.get("/phishing", getPhishingDomains);
router.get("/logs/country-counts", getCountryCounts);
router.get("/logs/recent-logs", async (req, res) => {
  try {

    const response = await axios.get(`http://log-service:8001/recent-logs`, {
      headers: { Accept: "application/json" }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching recent logs:", err.message);
    res.status(500).json({ error: "Failed to fetch recent logs" });
  }
});

router.get("/logs/persistent-stats", async (req, res) => {
  try {
    const response = await axios.get(`http://log-service:8001/persistent-stats`, {
      headers: { Accept: "application/json" }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching persistent stats:", err.message);
    res.status(500).json({ error: "Failed to fetch persistent stats" });
  }
});

router.get("/malicious-urls", async (req, res) => {
  try {
    const response = await axios.get(`https://urlhaus.abuse.ch/downloads/json_recent/`, {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "ThreatVista-Intelligence-Hub/1.0"
      },
      timeout: 30000
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error fetching malicious URLs:", err.message);
    res.status(500).json({ error: "Failed to fetch malicious URLs" });
  }
});

module.exports = router;
