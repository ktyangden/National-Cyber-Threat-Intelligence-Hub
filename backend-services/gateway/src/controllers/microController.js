const axios = require('axios');

const ml = async (req, res) => {
    const payload  = req.body;
    try {        
        const mlRes = await axios.post("http://ml-service:8000/predict", payload, {headers: { Authorization: `Bearer ${req.g2sToken}`}});
        res.status(201).json({ 'classifiedLog':mlRes.data });
    } catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ error: "Server error" });
    }
};

const log = async (req, res) => {
    const { classifiedLog } = req.body;
    
    // Validate that classifiedLog exists
    if (!classifiedLog) {
        console.log("Warning: classifiedLog is missing or null in request body");
        return res.status(400).json({ error: "classifiedLog is required" });
    }
    
    try {
        console.log("-----------------------------------------------------------------------------------------------------------------")
        console.log("Forwording request to LOG service");
        console.log("Token: ",req.g2sToken);
        
        console.log("-----------------------------------------------------------------------------------------------------------------")

        // Log service expects { classifiedLog: ... } format
        await axios.post("http://ml-service:8001/send-log", { classifiedLog }, {headers: { Authorization: `Bearer ${req.g2sToken}`}});
        res.status(201).json({ 'message': "Success" });

    } catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ error: "Server error" });
    }
};

const getPhishingDomains = async (req, res) => {
    try {
        const url = "https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt";
        const response = await axios.get(url, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        
        // Split by newline and filter out empty lines
        const allDomains = response.data
            .split("\n")
            .map(domain => domain.trim())
            .filter(Boolean);
        
        // Pagination parameters
        const limit = parseInt(req.query.limit) || 100; // Default 100, max 1000
        const page = parseInt(req.query.page) || 1;
        const maxLimit = 1000;
        const safeLimit = Math.min(limit, maxLimit);
        const offset = (page - 1) * safeLimit;
        
        // Get paginated results
        const paginatedDomains = allDomains.slice(offset, offset + safeLimit);
        
        res.status(200).json({ 
            domains: paginatedDomains,
            pagination: {
                total: allDomains.length,
                page: page,
                limit: safeLimit,
                totalPages: Math.ceil(allDomains.length / safeLimit),
                hasNext: offset + safeLimit < allDomains.length,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ error: "Failed to fetch phishing domains" });
    }
};

const getCountryCounts = async (req, res) => {
    try {
        // Proxy request to log-service (no auth needed for GET endpoint)
        const response = await axios.get("http://log-service:8001/country-counts", {
            headers: {
                'Accept': 'application/json',
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ error: "Failed to fetch country counts" });
    }
};

module.exports = { ml, log, getPhishingDomains, getCountryCounts };