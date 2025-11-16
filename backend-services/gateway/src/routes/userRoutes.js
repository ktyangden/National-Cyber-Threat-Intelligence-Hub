const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware")

const { getData } = require("../controllers/userController");

router.get("/getData", authMiddleware, getData);

module.exports = router;