const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null, select: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.imagePublicId;
        return ret;
      },
    },
  }
);

// Har query user ke hisaab se hoti hai; bina index ke poora collection scan hota tha
contactSchema.index({ user: 1, createdAt: 1 });
contactSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model("Contact", contactSchema);
