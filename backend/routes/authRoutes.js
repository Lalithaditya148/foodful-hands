const router = require("express").Router();
const controller = require("../controllers/authController");
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", controller.me);
router.post("/logout", controller.logout);
router.post("/reset-password", controller.resetPassword);
module.exports = router;
