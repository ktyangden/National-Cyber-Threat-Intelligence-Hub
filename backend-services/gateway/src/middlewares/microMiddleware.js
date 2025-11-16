const jwt = require("jsonwebtoken");

const tokenCache = {};

const SERVICE_KEYS = {
  dataService: process.env.DATA_SERVICE_KEY || "Data_Service_Key",
  otherService: process.env.OTHER_SERVICE_KEY || "Other_Service_Key"
};

// Token TTL
const TOKEN_TTL = 60 * 5;

function isTokenValid(entry) {
  return entry && entry.expiresAt > Date.now();
}

module.exports = async function (req, res, next) {
  try {
    let targetService = null;

    if (req.path.includes("getData") || req.path.includes("changeSecret")) {
      targetService = "dataService";
    }

    if (!targetService) {
      console.log("No target microservice found for route:", req.path);
      return next();
    }

    // Check cache
    let tokenEntry = tokenCache[targetService];

    if (!isTokenValid(tokenEntry)) {
      const serviceKey = SERVICE_KEYS[targetService];
      if (!serviceKey) throw new Error(`No service key found for ${targetService}`);

      const token = jwt.sign({ service: "gateway", target: targetService }, serviceKey, { expiresIn: TOKEN_TTL });

      console.log(`New G2S Token for ${targetService}: `, token);
  
      
      tokenEntry = { token, expiresAt: Date.now() + TOKEN_TTL * 1000 };
      tokenCache[targetService] = tokenEntry;
    }

    // Attach token to request 
    req.g2sToken = tokenEntry.token;

    console.log("Token in cache: ", tokenCache);

    next();
  } catch (error) {
    console.error("Error in microMiddleware:", error);
    return res.status(500).json({ error: "G2S token generation failed" });
  }
};

