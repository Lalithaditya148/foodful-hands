const ContactMessage = require("../models/ContactMessage");

async function createContactMessage(req, res, next) {
  try {
    const { name, phone, email, message } = req.body;
    if (![name, phone, email, message].every((value) => typeof value === "string" && value.trim()))
      return res.status(400).json({ success: false, message: "All contact fields are required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 10)
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email and phone number" });
    await ContactMessage.create({ name, phone, email, message });
    res.status(201).json({
      success: true,
      message: "Thanks! Our team will get back to you within one working day.",
    });
  } catch (error) {
    next(error);
  }
}

async function listContactMessages(req, res, next) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
}

async function updateContactStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["unread", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
}

async function deleteContactMessage(req, res, next) {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createContactMessage,
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
};
