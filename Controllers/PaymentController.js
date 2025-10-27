const Payment = require("../models/Payment");
const crypto = require("crypto");

exports.initiatePayment = async (req, res) => {
    try {
        const { amount, name, email } = req.body;

        if (!amount || !name || !email) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const payment = new Payment({
            userId: req.user.id,
            amount,
            name,
            email,
            status: "pending",
        });

        await payment.save();

        const paymentData = {
            merchant_id: process.env.MERCHANT_ID,
            merchant_key: process.env.MERCHANT_KEY,
            return_url: process.env.RETURN_URL,
            cancel_url: process.env.CANCEL_URL,
            amount: amount.toFixed(2),
            item_name: "LegalSphere Payment",
            name_first: name.split(" ")[0],
            name_last: name.split(" ")[1] || "",
            email_address: email,
            payment_id: payment._id.toString(),
        };

        // Form encode data
        const formBody = Object.entries(paymentData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");

        const redirectUrl = `${process.env.PAYFAST_URL}?${formBody}`;

        res.status(200).json({
            success: true,
            redirectUrl,
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.paymentSuccess = async (req, res) => {
    const paymentId = req.query.payment_id;
    await Payment.findByIdAndUpdate(paymentId, { status: "completed" });
    res.send("Payment successful! You will get confirmation shortly.");
};

exports.paymentCancel = async (req, res) => {
    const paymentId = req.query.payment_id;
    await Payment.findByIdAndUpdate(paymentId, { status: "cancelled" });
    res.send("Payment cancelled by user.");
};
