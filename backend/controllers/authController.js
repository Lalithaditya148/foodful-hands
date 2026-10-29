const bcrypt = require("bcryptjs");
const User = require("../models/User");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Cost 12 in production (~500ms), 10 in dev (~100ms) — still secure either way
const BCRYPT_ROUNDS = process.env.NODE_ENV === "production" ? 12 : 10;

function validateUserInput(body) {
  const { name, email, phone, city, address, password, role } = body;
  if (
    ![name, email, phone, city, address, password, role].every(
      (value) => typeof value === "string" && value.trim(),
    )
  )
    return "All fields are required";
  if (!emailPattern.test(email.trim())) return "Please enter a valid email address";
  if (phone.replace(/\D/g, "").length < 10) return "Please enter a valid phone number";
  if (password.length < 6) return "Password must be at least 6 characters long";
  if (!["donor", "organization"].includes(role)) return "Invalid registration role";
  return null;
}

async function register(req, res, next) {
  try {
    const validationError = validateUserInput(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const email = req.body.email.trim().toLowerCase();
    if (await User.exists({ email }))
      return res
        .status(409)
        .json({ success: false, message: "An account with this email already exists" });
    const { name, phone, city, address, password, role, managerName, orgType } = req.body;
    if (password.length > 72)
      return res
        .status(400)
        .json({ success: false, message: "Password must not exceed 72 characters" });
    const user = await User.create({
      name,
      email,
      phone,
      city,
      address,
      role,
      managerName: role === "organization" ? managerName || undefined : undefined,
      orgType: role === "organization" ? orgType || "orphanage" : undefined,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      orgStatus: role === "organization" ? "pending" : undefined,
    });
    const userId = user._id.toString();
    const userRole = user.role;
    req.session.regenerate((err) => {
      if (err) return next(err);
      if (userRole === "donor") {
        req.session.userId = userId;
        req.session.role = userRole;
      }
      res.status(201).json({ success: true, message: "Account created", user });
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    const user = await User.findOne({ email }).select("+password");
    let valid = false;
    if (user) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      await bcrypt.compare(
        password,
        "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali",
      );
    }
    if (!user || !valid)
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (user.role === "organization" && user.orgStatus !== "approved")
      return res.status(403).json({
        success: false,
        message:
          user.orgStatus === "rejected"
            ? "Your organization request was rejected. Contact support."
            : "Your organization is waiting for admin approval.",
      });
    const userId = user._id.toString();
    const role = user.role;
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = userId;
      req.session.role = role;
      res.json({ success: true, user });
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ success: false, message: "Not logged in" });
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ success: false, message: "Not logged in" });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out" });
  });
}

async function resetPassword(req, res, next) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!emailPattern.test(email) || newPassword.length < 6 || newPassword.length > 72)
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and a new password between 6 and 72 characters",
      });
    // Demo flow only: production should require email verification, OTP, or a secure reset token.
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ success: false, message: "Invalid email or current password" });
    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me, logout, resetPassword };
