const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
const app = express();

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes branching
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Default Route
app.get('/', (req, res) => {
    res.json({ 'message': "Gateway API is running" });
});

// MongoDB 
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Gateway Server running on port ${PORT}`));
