const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/userController");
router.patch("/profile", auth, controller.updateProfile);
router.delete("/account", auth, controller.deleteAccount);
router.get("/", auth, role("admin"), controller.listUsers);
router.patch("/:id/org-status", auth, role("admin"), controller.setOrgStatus);
module.exports = router;
