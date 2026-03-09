const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

router.post("/register", auth.register);
router.post("/verify", auth.verifyOTP);
router.post("/login", auth.login);
router.post("/logout", auth.logout);   // ✅ ADD THIS
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password/:token", auth.resetPassword);

module.exports = router;