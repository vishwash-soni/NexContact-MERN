const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    attempts: {
        type: Number,
        default: 1
    },

    expiresAt: {
        type: Date,
        required: true
    },

    lockUntil: {
        type: Date,
        default: null
    }
})

module.exports = mongoose.model("EmailVerify", emailSchema);