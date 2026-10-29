const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    donorName: { type: String, trim: true },
    donorPhone: { type: String, trim: true },
    eventType: {
      type: String,
      enum: ["Marriage", "Function", "Temple", "Birthday", "Community Event", "Other"],
      default: "Function",
    },
    foodType: { type: String, enum: ["Veg", "Non-Veg"], default: "Veg" },
    foodName: { type: String, required: true, trim: true, maxlength: 120 },
    quantity: { type: Number, required: true, min: 1, max: 100000 },
    preparedAt: { type: Date, required: true },
    availableUntil: { type: Date, required: true },
    pickupAddress: { type: String, required: true, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    mapUrl: { type: String, trim: true, maxlength: 500 },
    imageUrl: { type: String, trim: true, maxlength: 2000 },
    originalQuantity: { type: Number },
    claimedQuantity: { type: Number },
    safetyConfirmed: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: ["available", "claimed", "picked_up", "delivered", "cancelled"],
      default: "available",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Donation", donationSchema);
