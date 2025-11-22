const express = require("express");
const router = express.Router();

const microMiddleware = require("../middlewares/microMiddleware")

const { ml, log } = require("../controllers/microController");

router.post("/ml", microMiddleware, ml);
router.post("/log", microMiddleware, log);

module.exports = router;
