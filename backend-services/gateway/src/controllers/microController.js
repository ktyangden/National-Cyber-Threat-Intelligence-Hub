const axios = require('axios');

const ml = async (req, res) => {
    const payload  = req.body;
    try {        
        const mlRes = await axios.post("http://localhost:8000/predict", payload, {headers: { Authorization: `Bearer ${req.g2sToken}`}});
        res.status(201).json({ 'classifiedLog':mlRes.data });
    } catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ error: "Server error" });
    }
};

const log = async (req, res) => {
    const { classifiedLog } = req.body;
    try {
        await axios.post("http://localhost:8001/send-log", classifiedLog, {headers: { Authorization: `Bearer ${req.g2sToken}`}});
        res.status(201).json({ 'message': "Success" });

    } catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { ml, log };