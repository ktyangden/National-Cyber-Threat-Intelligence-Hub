const express = require('express');
// const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const microRoutes = require("./routes/microRoutes");
const extRoutes = require("./routes/extRoutes");

dotenv.config();
const app = express();

// Middlewares
// app.use(cors({
//     origin: "http://frontend:5173",
//     credentials: true,
// }));
app.use(cors({
    origin: (origin, callback) => {
        callback(null, origin); // reflect the request origin
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes branching
app.use('/auth', authRoutes);
// app.use('/user', userRoutes);
app.use('/micro', microRoutes);
app.use('/api/v1/ext', extRoutes);

// Default Route
app.get('/', (req, res) => {
    res.json({ 'message': "Gateway API is running" });
});

// MongoDB 
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('MongoDB connected'))
//     .catch((err) => console.error(err));

// Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Gateway Server running on port ${PORT}`));
