const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    },

    method: {
        type: String, enum: ["EasyPaisa", "JazzCash"],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String, enum: ["pending", "completed", "failed"],
        default: "pending"
    },

    transactionId: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model("Payment", PaymentSchema);
