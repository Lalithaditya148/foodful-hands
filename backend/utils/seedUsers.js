require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Donation = require("../models/Donation");
const ContactMessage = require("../models/ContactMessage");

const users = [
  {
    name: "Platform Admin",
    email: "admin@smartfoodhub.org",
    phone: "+91 98765 43210",
    city: "Vijayawada",
    address: "Benz Circle, Vijayawada",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Ravi Kumar (Donor)",
    email: "donor@demo.com",
    phone: "+91 90000 11111",
    city: "Vijayawada",
    address: "Gandhi Nagar, Vijayawada",
    password: "donor123",
    role: "donor",
  },
  {
    name: "Sunrise Orphanage",
    managerName: "Sister Mary",
    orgType: "orphanage",
    email: "org@demo.com",
    phone: "+91 90000 22222",
    city: "Vijayawada",
    address: "Patamata, Vijayawada",
    password: "org123",
    role: "organization",
    orgStatus: "approved",
  },
  {
    name: "Hope Elders Care Home",
    managerName: "Lakshmi Prasad",
    orgType: "old_age_home",
    email: "hope@demo.com",
    phone: "+91 90000 33333",
    city: "Vijayawada",
    address: "Bhavanipuram, Vijayawada",
    password: "org123",
    role: "organization",
    orgStatus: "pending",
  },
];

async function seed() {
  await connectDB();

  // 1. Seed Users
  const userMap = {};
  for (const input of users) {
    let existing = await User.findOne({ email: input.email });
    if (!existing) {
      existing = await User.create({ ...input, password: await bcrypt.hash(input.password, 12) });
      console.log(`Seeded user: ${input.email}`);
    } else {
      userMap[input.email] = existing;
    }
    userMap[input.email] = existing;
  }

  const donor = userMap["donor@demo.com"];
  const org = userMap["org@demo.com"];

  // 2. Seed Sample Donations if none exist
  const donationCount = await Donation.countDocuments();
  if (donationCount === 0) {
    const now = Date.now();
    const oneHourAgo = new Date(now - 3600000);
    const twoHoursAgo = new Date(now - 7200000);
    const fourHoursLater = new Date(now + 14400000);
    const threeHoursLater = new Date(now + 10800000);
    const twoHoursLater = new Date(now + 7200000);

    const sampleDonations = [
      {
        donor: donor._id,
        donorName: donor.name,
        donorPhone: donor.phone,
        eventType: "Marriage",
        foodType: "Veg",
        foodName: "Hyderabadi Veg Biryani & Salan",
        quantity: 50,
        originalQuantity: 50,
        preparedAt: oneHourAgo,
        availableUntil: fourHoursLater,
        pickupAddress: "Subham Kalyana Mandapam, MG Road",
        city: "Vijayawada",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=MG+Road+Vijayawada",
        imageUrl:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
        safetyConfirmed: true,
        status: "available",
      },
      {
        donor: donor._id,
        organization: org._id,
        donorName: donor.name,
        donorPhone: donor.phone,
        eventType: "Function",
        foodType: "Veg",
        foodName: "South Indian Thali (Rice, Sambar, Poriyal)",
        quantity: 40,
        originalQuantity: 60,
        claimedQuantity: 40,
        preparedAt: oneHourAgo,
        availableUntil: threeHoursLater,
        pickupAddress: "Sita Kalyana Vedika, Governorpet",
        city: "Vijayawada",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Governorpet+Vijayawada",
        imageUrl:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
        safetyConfirmed: true,
        status: "claimed",
      },
      {
        donor: donor._id,
        organization: org._id,
        donorName: donor.name,
        donorPhone: donor.phone,
        eventType: "Community Event",
        foodType: "Veg",
        foodName: "Hot Chapati & Dal Tadka",
        quantity: 30,
        originalQuantity: 30,
        claimedQuantity: 30,
        preparedAt: twoHoursAgo,
        availableUntil: twoHoursLater,
        pickupAddress: "Grand Celebration Hall, Benz Circle",
        city: "Vijayawada",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Benz+Circle+Vijayawada",
        imageUrl:
          "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
        safetyConfirmed: true,
        status: "picked_up",
      },
      {
        donor: donor._id,
        organization: org._id,
        donorName: donor.name,
        donorPhone: donor.phone,
        eventType: "Birthday",
        foodType: "Veg",
        foodName: "Paneer Pulao & Gulab Jamun",
        quantity: 45,
        originalQuantity: 45,
        claimedQuantity: 45,
        preparedAt: twoHoursAgo,
        availableUntil: twoHoursLater,
        pickupAddress: "Ananda Nilayam Function Hall, Labbipet",
        city: "Vijayawada",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Labbipet+Vijayawada",
        imageUrl:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
        safetyConfirmed: true,
        status: "delivered",
      },
    ];

    await Donation.insertMany(sampleDonations);
    console.log("Seeded 4 sample food donations across all 4 tracking stages!");
  }

  // 3. Seed Sample Contact Messages if none exist
  const messageCount = await ContactMessage.countDocuments();
  if (messageCount === 0) {
    await ContactMessage.insertMany([
      {
        name: "Kavitha Sharma",
        phone: "+91 98480 12345",
        email: "kavitha.s@gmail.com",
        message:
          "Hello! We run a catering business in Governorpet. Can we register as a recurring donor for weekend weddings?",
        status: "unread",
      },
      {
        name: "Venkatesh Rao",
        phone: "+91 99887 65432",
        email: "venkatesh.rao@yahoo.com",
        message:
          "Thank you for this wonderful initiative! Our orphanage received 40 meals yesterday on time.",
        status: "resolved",
      },
    ]);
    console.log("Seeded 2 sample contact inquiries!");
  }

  await mongoose.disconnect();
  console.log("Seeding finished successfully!");
}

seed().catch((error) => {
  console.error("Seeding error:", error);
  process.exitCode = 1;
});
