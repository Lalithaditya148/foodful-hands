const Donation = require("../models/Donation");
const User = require("../models/User");

function validateDonation(body) {
  const { foodName, quantity, preparedAt, availableUntil, pickupAddress, city, safetyConfirmed } =
    body;
  if (
    ![foodName, preparedAt, availableUntil, pickupAddress, city].every(
      (value) => typeof value === "string" && value.trim(),
    )
  )
    return "All donation fields are required";
  if (Number.isNaN(Date.parse(preparedAt)) || Number.isNaN(Date.parse(availableUntil)))
    return "Invalid date format for prepared time or available until time";
  if (new Date(preparedAt) > new Date()) return "Prepared time cannot be in the future";
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)
    return "Quantity must be a whole number greater than zero";
  if (new Date(preparedAt) >= new Date(availableUntil))
    return "Available-until time must be after prepared time";
  if (new Date(availableUntil) <= new Date()) return "Available-until time must be in the future";
  if (safetyConfirmed !== true) return "Please confirm the food safety requirements";
  return null;
}

async function createDonation(req, res, next) {
  try {
    const validationError = validateDonation(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const {
      foodName,
      quantity,
      preparedAt,
      availableUntil,
      pickupAddress,
      city,
      safetyConfirmed,
      mapUrl,
      imageUrl,
      eventType,
      foodType,
      donorPhone,
    } = req.body;
    if (mapUrl && !mapUrl.startsWith("http://") && !mapUrl.startsWith("https://"))
      return res
        .status(400)
        .json({ success: false, message: "Map URL must start with http:// or https://" });
    if (imageUrl && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))
      return res
        .status(400)
        .json({ success: false, message: "Image URL must start with http:// or https://" });
    const donation = await Donation.create({
      foodName,
      preparedAt,
      availableUntil,
      pickupAddress,
      city,
      safetyConfirmed,
      donor: req.user._id,
      donorName: req.user.name,
      donorPhone: donorPhone || req.user.phone,
      eventType: eventType || "Function",
      foodType: foodType || "Veg",
      quantity: Number(quantity),
      originalQuantity: Number(quantity),
      mapUrl: mapUrl || undefined,
      imageUrl: imageUrl || undefined,
    });
    await donation.populate("donor", "name city phone");
    // Emit real-time event for new donation
    req.app.locals.io?.to("donations:all").emit("donation:created", donation);
    res.status(201).json({ success: true, message: "Donation posted", donation });
  } catch (error) {
    next(error);
  }
}

async function listDonations(req, res, next) {
  try {
    if (req.user.role === "organization" && req.user.orgStatus !== "approved")
      return res
        .status(403)
        .json({ success: false, message: "Organization must be approved to view donations" });
    const filter =
      req.user.role === "donor"
        ? { donor: req.user._id }
        : req.user.role === "organization"
          ? {
              $or: [
                { status: "available", availableUntil: { $gt: new Date() } },
                { organization: req.user._id },
              ],
            }
          : {};
    const donations = await Donation.find(filter)
      .populate("donor", "name city phone")
      .populate("organization", "name city phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (error) {
    next(error);
  }
}

async function claimDonation(req, res, next) {
  try {
    if (req.user.orgStatus !== "approved")
      return res
        .status(403)
        .json({ success: false, message: "Only approved organizations can claim donations" });

    const existing = await Donation.findOne({
      _id: req.params.id,
      status: "available",
      availableUntil: { $gt: new Date() },
    });
    if (!existing)
      return res.status(404).json({ success: false, message: "Donation is no longer available" });

    const io = req.app.locals.io;
    const requestedQty = req.body.quantityToClaim ? Number(req.body.quantityToClaim) : null;

    // Check if partial quantity split is requested
    if (requestedQty && requestedQty > 0 && requestedQty < existing.quantity) {
      // 1. Reduce remaining quantity on available batch
      existing.quantity = existing.quantity - requestedQty;
      await existing.save();
      await existing.populate("donor", "name city phone");

      // 2. Create claimed sub-donation for this organization
      const claimedDonation = await Donation.create({
        foodName: existing.foodName,
        quantity: requestedQty,
        originalQuantity: existing.originalQuantity || existing.quantity + requestedQty,
        claimedQuantity: requestedQty,
        preparedAt: existing.preparedAt,
        availableUntil: existing.availableUntil,
        pickupAddress: existing.pickupAddress,
        city: existing.city,
        mapUrl: existing.mapUrl,
        imageUrl: existing.imageUrl,
        eventType: existing.eventType,
        foodType: existing.foodType,
        donorName: existing.donorName,
        donorPhone: existing.donorPhone,
        safetyConfirmed: true,
        donor: existing.donor,
        organization: req.user._id,
        status: "claimed",
      });
      await claimedDonation.populate("donor", "name city phone");
      await claimedDonation.populate("organization", "name city phone");

      // Notify clients of both the remaining pool update and the new claimed mission
      io?.to("donations:all").emit("donation:updated", existing);
      io?.to("donations:all").emit("donation:created", claimedDonation);
      return res.json({
        success: true,
        message: `Claimed ${requestedQty} meals. Remaining ${existing.quantity} meals stay available for other homes.`,
        donation: claimedDonation,
      });
    }

    // Full batch claim
    existing.status = "claimed";
    existing.organization = req.user._id;
    existing.claimedQuantity = existing.quantity;
    await existing.save();
    await existing.populate("donor", "name city phone");
    await existing.populate("organization", "name city phone");

    io?.to(`donation:${existing._id}`).emit("donation:updated", existing);
    io?.to("donations:all").emit("donation:updated", existing);
    res.json({ success: true, message: "Donation claimed", donation: existing });
  } catch (error) {
    next(error);
  }
}

async function updateDonationStatus(req, res, next) {
  try {
    const requestedStatus = req.body.status;
    if (!["picked_up", "delivered", "cancelled"].includes(requestedStatus))
      return res.status(400).json({ success: false, message: "Invalid donation status" });
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });
    const currentStatus = donation.status;
    const isDonor = donation.donor.equals(req.user._id) && req.user.role === "donor";
    const isOrganization =
      donation.organization?.equals(req.user._id) && req.user.role === "organization";
    const isAdmin = req.user.role === "admin";
    const validTransition =
      (requestedStatus === "cancelled" &&
        (currentStatus === "available" || currentStatus === "claimed") &&
        (isDonor || isAdmin)) ||
      (requestedStatus === "picked_up" &&
        currentStatus === "claimed" &&
        (isOrganization || isAdmin)) ||
      (requestedStatus === "delivered" &&
        currentStatus === "picked_up" &&
        (isOrganization || isAdmin));
    if (!validTransition)
      return res.status(403).json({
        success: false,
        message: "This donation status cannot be changed by your account",
      });
    donation.status = requestedStatus;
    await donation.save();
    await donation.populate("donor", "name city phone");
    await donation.populate("organization", "name city phone");
    // Emit real-time event for status update
    const io = req.app.locals.io;
    io?.to(`donation:${donation._id}`).emit("donation:updated", donation);
    io?.to("donations:all").emit("donation:updated", donation);
    res.json({ success: true, message: "Donation status updated", donation });
  } catch (error) {
    next(error);
  }
}

async function getStats(_req, res, next) {
  try {
    const [totalDelivered, totalDonations, verifiedOrgs, totalDonors] = await Promise.all([
      Donation.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, meals: { $sum: "$quantity" } } },
      ]),
      Donation.countDocuments(),
      User.countDocuments({ role: "organization", orgStatus: "approved" }),
      User.countDocuments({ role: "donor" }),
    ]);
    const mealsRescued = totalDelivered[0]?.meals ?? 0;
    res.json({
      success: true,
      stats: {
        mealsRescued,
        verifiedOrgs,
        totalDonors,
        totalDonations,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createDonation, listDonations, claimDonation, updateDonationStatus, getStats };
