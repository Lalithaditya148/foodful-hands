const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/donationController");

router.get("/stats", controller.getStats);
router.get("/", auth, role("donor", "organization", "admin"), controller.listDonations);
router.post("/", auth, role("donor"), controller.createDonation);
router.patch("/:id/claim", auth, role("organization"), controller.claimDonation);
router.patch(
  "/:id/status",
  auth,
  role("donor", "organization", "admin"),
  controller.updateDonationStatus,
);

module.exports = router;
