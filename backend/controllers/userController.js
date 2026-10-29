const User = require("../models/User");

async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "city", "address"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key)),
    );
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ success: false, message: "No valid profile fields provided" });
    if (Object.values(updates).some((value) => typeof value !== "string" || !value.trim()))
      return res
        .status(400)
        .json({ success: false, message: "Profile values must be non-empty text" });
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

async function listUsers(_req, res, next) {
  try {
    res.json({
      success: true,
      users: await User.find({ role: "organization" }).sort({ createdAt: -1 }),
    });
  } catch (error) {
    next(error);
  }
}

async function setOrgStatus(req, res, next) {
  try {
    if (!["approved", "rejected"].includes(req.body.status))
      return res.status(400).json({ success: false, message: "Invalid organization status" });
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "organization" },
      { orgStatus: req.body.status },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(404).json({ success: false, message: "Organization not found" });
    req.app.locals.io?.emit("org:status_changed", user);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const Donation = require("../models/Donation");
    await Donation.updateMany(
      { donor: req.user._id, status: "available" },
      { status: "cancelled" },
    );
    await Donation.updateMany(
      { organization: req.user._id, status: "claimed" },
      { $unset: { organization: "" }, status: "available" },
    );
    await User.findByIdAndDelete(req.user._id);
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Account deleted" });
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { updateProfile, listUsers, setOrgStatus, deleteAccount };
