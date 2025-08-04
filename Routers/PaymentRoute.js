const express = require("express");
const router = express.Router();
const { initiatePayment, paymentSuccess, paymentCancel } = require("../Controllers/PaymentController");
const authMiddleware = require("../Middleware/authMiddleware");

router.post("/pay", authMiddleware, initiatePayment);
router.get("/success", paymentSuccess);
router.get("/cancel", paymentCancel);

module.exports = router;
