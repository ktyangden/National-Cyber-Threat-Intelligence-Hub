const axios = require("axios");
//const jwt = require("jsonwebtoken");

// const SERVICE_KEYS = {
//   mlService: process.env.ML_Service_Key || "ml-secret-key",
//   logService: process.env.Log_Service_Key || "log-secret-key"
// };

// Tokens in-Memory
const tokenCache = {};

// Token TTL - 5 minutes
const TOKEN_TTL = 60 * 5;

function isTokenValid(entry) {
  return entry && entry.expiresAt > Date.now();
}

module.exports = async function (req, res, next) {
  try {
    let targetService = null;

    if (req.path.includes("ml")) {
      targetService = "mlService";
    }
    else if (req.path.includes("log")) {
      targetService = "logService";
    }

    if (!targetService) {
      console.log("No target microservice found for route:", req.path);
      return next();
    }

    // Check cache
    let tokenEntry = tokenCache[targetService];

    if (!isTokenValid(tokenEntry)) {
      console.log(`Fetching new G2S token from Auth Service for ${targetService}...`);

      const response = await axios.post(
        "http://auth-service:8005/micro/auth/getG2S",
        { targetService }
      );

      const token = response.data.token;

      tokenEntry = { token, expiresAt: Date.now() + TOKEN_TTL * 1000 };
      tokenCache[targetService] = tokenEntry;
    }

    // Attach token to request 
    req.g2sToken = tokenEntry.token;

    //console.log("Token in cache: ", tokenCache);

    next();
  } catch (error) {
    console.error("Error in microMiddleware:", error);
    return res.status(500).json({ error: "G2S token generation failed" });
  }
};

