const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["donor", "organization", "admin"], default: "donor" },
    managerName: { type: String, trim: true, maxlength: 120 },
    orgType: { type: String, enum: ["orphanage", "old_age_home", "other"], default: undefined },
    orgStatus: { type: String, enum: ["pending", "approved", "rejected"], default: undefined },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password;
    return ret;
  },
});
module.exports = mongoose.model("User", userSchema);
