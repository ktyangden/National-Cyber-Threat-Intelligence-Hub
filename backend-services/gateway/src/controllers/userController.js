const axios = require('axios');

const getData = async (req, res) => {
    const userId = req.user.user_id;
    try {        
        const userRes = await axios.get("http://localhost:8005/api/auth/getData", { params: {userId} });
        res.status(200).json(userRes.data);
    } catch (error) {
        console.log("Error getting data: ", error.response?.data || error.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getData };