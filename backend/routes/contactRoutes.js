const router = require("express").Router();
const {
  createContactMessage,
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
} = require("../controllers/contactController");
const requireAuth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.post("/", createContactMessage);
router.get("/", requireAuth, requireRole("admin"), listContactMessages);
router.patch("/:id/status", requireAuth, requireRole("admin"), updateContactStatus);
router.delete("/:id", requireAuth, requireRole("admin"), deleteContactMessage);

module.exports = router;
