import {
  Bell,
  Clock,
  History,
  Layers,
  MapPin,
  ShieldCheck,
  Smartphone,
  Timer,
  UtensilsCrossed,
} from "lucide-react";

export const featureList = [
  {
    icon: UtensilsCrossed,
    title: "Donate Food",
    text: "Post surplus meals from weddings, functions, temples and events in under a minute.",
  },
  {
    icon: MapPin,
    title: "Live Location",
    text: "Google Maps pin plus address so pickup teams reach the food without a phone call.",
  },
  {
    icon: Clock,
    title: "Auto Expiry (5 Hours)",
    text: "Available Until is locked to prepared time + 5 hours. No manual expiry, no unsafe food.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    text: "Only nearby verified orphanages and old age homes get alerted, sorted by distance.",
  },
  {
    icon: Layers,
    title: "Quantity Split",
    text: "Multiple homes can each accept exactly the number of meals they need.",
  },
  {
    icon: Timer,
    title: "Countdown Timer",
    text: "Every donation shows remaining time with green, yellow and red priority badges.",
  },
  {
    icon: Smartphone,
    title: "Responsive UI",
    text: "Built mobile-first for volunteers coordinating pickups on the road.",
  },
  {
    icon: History,
    title: "Donation History",
    text: "Full audit trail from Available to Delivered for donors and organizations.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Verification",
    text: "Every organization is manually approved before it can accept a single meal.",
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Register",
    text: "Donors sign up instantly. Organizations register and wait for admin verification.",
  },
  {
    step: "02",
    title: "Donate Food",
    text: "Add food details, quantity, prepared time and location with a hygiene confirmation.",
  },
  {
    step: "03",
    title: "Nearby Alerts",
    text: "Verified homes within range receive an instant notification with distance and timer.",
  },
  {
    step: "04",
    title: "Accept Quantity",
    text: "Each home accepts only the meals it needs until the remaining quantity reaches zero.",
  },
  {
    step: "05",
    title: "Pickup",
    text: "Volunteers collect the food and mark the donation as picked up in real time.",
  },
  {
    step: "06",
    title: "Delivery",
    text: "Food reaches children and elders while it is still fresh, safe and warm.",
  },
];

export const stats = [
  { value: "48,200+", label: "Meals Rescued" },
  { value: "310", label: "Verified Homes" },
  { value: "1,860", label: "Active Donors" },
  { value: "27 min", label: "Avg. Pickup Time" },
];

export const testimonials = [
  {
    quote:
      "After my daughter's wedding we had food for nearly 200 people left over. Within twenty minutes three homes had claimed all of it.",
    name: "Ramesh Varma",
    role: "Donor, Vijayawada",
  },
  {
    quote:
      "The countdown timer changed everything for us. We only accept what we can collect in time, so nothing is ever wasted.",
    name: "Sister Anita Joseph",
    role: "Manager, Hope Children's Home",
  },
  {
    quote:
      "Splitting a single donation across three homes used to take a dozen phone calls. Now it happens on one screen.",
    name: "Lakshmi Prasad",
    role: "Manager, Sandhya Old Age Home",
  },
];
