const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: null
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Har query "user" se filter hoti hai, isliye index (contacts badhne par bhi fast)
contactSchema.index({ user: 1 });

module.exports = mongoose.model("Contact", contactSchema);