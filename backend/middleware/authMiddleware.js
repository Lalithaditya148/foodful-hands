const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    if (!req.session.userId)
      return res.status(401).json({ success: false, message: "Authentication required" });
    const user = await User.findById(req.session.userId);
    if (!user) {
      return req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(401).json({ success: false, message: "Session is no longer valid" });
      });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
