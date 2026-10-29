const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["unread", "resolved"], default: "unread" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
