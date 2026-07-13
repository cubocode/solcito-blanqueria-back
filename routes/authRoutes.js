const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

// Define authentication routes
router.post("/login", AuthController.login);

module.exports = router;
