import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  HeartHandshake,
  Image,
  LoaderCircle,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  Radio,
  Salad,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth, type AppUser } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export type EventType =
  | "Marriage"
  | "Function"
  | "Temple"
  | "Birthday"
  | "Community Event"
  | "Other";

export type FoodType = "Veg" | "Non-Veg";

export type Donation = {
  _id: string;
  foodName: string;
  eventType?: EventType;
  foodType?: FoodType;
  donorName?: string;
  donorPhone?: string;
  quantity: number;
  originalQuantity?: number;
  claimedQuantity?: number;
  preparedAt: string;
  availableUntil: string;
  pickupAddress: string;
  city: string;
  mapUrl?: string;
  imageUrl?: string;
  status: "available" | "claimed" | "picked_up" | "delivered" | "cancelled";
  donor?: { name: string; city: string; phone?: string };
  organization?: { name: string; city: string; phone?: string };
  createdAt?: string;
  updatedAt?: string;
};

type DonationsResponse = { success: boolean; donations: Donation[] };

const trackingSteps: {
  key: Donation["status"];
  label: string;
  icon: typeof UtensilsCrossed;
  description: string;
}[] = [
  {
    key: "available",
    label: "Posted & Waiting",
    icon: UtensilsCrossed,
    description: "Surplus food listed, awaiting nearby verified home",
  },
  {
    key: "claimed",
    label: "Rescue Approved",
    icon: ShieldCheck,
    description: "Approved partner claimed food & coordinating pickup",
  },
  {
    key: "picked_up",
    label: "In Transit",
    icon: Truck,
    description: "Volunteer collected food and is en route",
  },
  {
    key: "delivered",
    label: "Delivered & Fed",
    icon: CheckCircle2,
    description: "Meals safely delivered to verified recipients",
  },
];

const sampleFoodImages = [
  {
    label: "Biryani & Rice",
    url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  },
  {
    label: "Curry & Meals",
    url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  },
  {
    label: "Roti & Chapati",
    url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  },
  {
    label: "Snacks & Tiffin",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  },
];

export function DonorWorkspace() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    eventType: "Marriage" as EventType,
    foodType: "Veg" as FoodType,
    foodName: "",
    quantity: "",
    preparedAt: "",
    availableUntil: "",
    pickupAddress: "",
    city: "",
    donorPhone: "",
    imageUrl: "",
    safetyConfirmed: false,
  });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        pickupAddress: prev.pickupAddress || user.address || "",
        city: prev.city || user.city || "",
        donorPhone: prev.donorPhone || user.phone || "",
      }));
    }
  }, [user]);

  async function loadDonations() {
    try {
      const response = await apiRequest<DonationsResponse>("/donations");
      setDonations(response.donations);
    } catch {
      // Ignore background fetch error
    }
  }

  useEffect(() => {
    void loadDonations();
    const socket = getSocket();
    socket.emit("watch:donations");

    const handleCreated = (newDonation: Donation) => {
      setDonations((prev) => {
        if (prev.some((d) => d._id === newDonation._id)) return prev;
        return [newDonation, ...prev];
      });
    };

    const handleUpdated = (updatedDonation: Donation) => {
      setDonations((prev) =>
        prev.map((d) => (d._id === updatedDonation._id ? updatedDonation : d)),
      );
      if (updatedDonation.status === "claimed") {
        toast.success(
          `Live Tracking: ${updatedDonation.organization?.name || "A verified organization"} approved & claimed ${updatedDonation.foodName}!`,
        );
      } else if (updatedDonation.status === "picked_up") {
        toast.info(`Live Tracking: Food for ${updatedDonation.foodName} has been picked up!`);
      } else if (updatedDonation.status === "delivered") {
        toast.success(`Live Tracking: ${updatedDonation.foodName} was delivered successfully! 🎉`);
      }
    };

    socket.on("donation:created", handleCreated);
    socket.on("donation:updated", handleUpdated);

    const refreshTimer = window.setInterval(() => void loadDonations(), 30000);
    return () => {
      socket.off("donation:created", handleCreated);
      socket.off("donation:updated", handleUpdated);
      window.clearInterval(refreshTimer);
    };
  }, []);

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handlePreparedAtChange(val: string) {
    update("preparedAt", val);
    if (val) {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(d.getHours() + 5);
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        update("availableUntil", iso);
      }
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.safetyConfirmed) {
      setMessage("Please confirm the food safety requirements.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await apiRequest("/donations", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          donorPhone: form.donorPhone || user?.phone,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${form.pickupAddress}, ${form.city}`)}`,
        }),
      });
      setForm({
        eventType: "Marriage",
        foodType: "Veg",
        foodName: "",
        quantity: "",
        preparedAt: "",
        availableUntil: "",
        pickupAddress: user?.address || "",
        city: user?.city || "",
        donorPhone: user?.phone || "",
        imageUrl: "",
        safetyConfirmed: false,
      });
      setMessage("Donation posted successfully. Nearby homes are being notified.");
      toast.success("Food donation listed! Live tracking will activate once claimed.");
      await loadDonations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to post donation");
    } finally {
      setLoading(false);
    }
  }

  async function cancelDonation(id: string) {
    try {
      await apiRequest(`/donations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      setMessage("Donation cancelled.");
      toast.info("Donation cancelled.");
      await loadDonations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to cancel donation");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="size-5 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Post surplus food</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Share details so a nearby verified home can claim it. Expiry is auto-calculated to 5 hours
          for safety.
        </p>

        {user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-foreground">
            <div>
              <span className="font-semibold text-primary">Logged in as:</span> {user.name}{" "}
              {user.phone ? `(${user.phone})` : ""}
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Auto-filled details
            </span>
          </div>
        )}

        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Event Type */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Event Type
            </label>
            <select
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value as EventType)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="Marriage">Marriage</option>
              <option value="Function">Function</option>
              <option value="Temple">Temple</option>
              <option value="Birthday">Birthday</option>
              <option value="Community Event">Community Event</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Food Type (Veg / Non-Veg) */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Food Type
            </label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => update("foodType", "Veg")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                  form.foodType === "Veg"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Salad className="size-3.5 text-emerald-600" /> Veg
              </button>
              <button
                type="button"
                onClick={() => update("foodType", "Non-Veg")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                  form.foodType === "Non-Veg"
                    ? "border-red-500 bg-red-500/15 text-red-700 dark:text-red-400 shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Flame className="size-3.5 text-red-600" /> Non-Veg
              </button>
            </div>
          </div>

          <Input
            label="Food name"
            value={form.foodName}
            onChange={(value) => update("foodName", value)}
            placeholder="e.g. Vegetable Biryani, Dal & Roti"
          />
          <Input
            label="Meals available"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(value) => update("quantity", value)}
            placeholder="50"
          />
          <Input
            label="Prepared time"
            type="datetime-local"
            value={form.preparedAt}
            onChange={handlePreparedAtChange}
          />

          {/* Available Until (Auto 5-Hr Expiry Rule) */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Available Until (Auto 5-Hr Expiry)
            </label>
            <div className="mt-2 flex h-[42px] items-center justify-between rounded-xl border border-input bg-muted/40 px-3 text-xs text-foreground">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock3 className="size-4 text-warning" />
                <span className="font-medium text-foreground">
                  {form.availableUntil
                    ? new Date(form.availableUntil).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Set prepared time"}
                </span>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                +5 Hours Rule
              </span>
            </div>
          </div>

          <Input
            label="Pickup address"
            value={form.pickupAddress}
            onChange={(value) => update("pickupAddress", value)}
            placeholder="Hall name, Street, Landmark"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(value) => update("city", value)}
            placeholder="Vijayawada"
          />
          <Input
            label="Donor contact phone"
            type="tel"
            value={form.donorPhone}
            onChange={(value) => update("donorPhone", value)}
            placeholder="+91 90000 00000"
          />

          {/* Food Photo URL & Presets */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Food Photo (Optional URL or Click Preset)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://example.com/food-photo.jpg"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground font-medium">
                Quick sample photos:
              </span>
              {sampleFoodImages.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => update("imageUrl", sample.url)}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    form.imageUrl === sample.url
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={form.safetyConfirmed}
              onChange={(event) => update("safetyConfirmed", event.target.checked)}
              className="mt-0.5 accent-primary"
            />{" "}
            I confirm that this food was prepared today, stored hygienically, and is safe for donation.
          </label>

          <button
            type="submit"
            disabled={loading}
            className="gradient-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:col-span-2"
          >
            <Send className="size-4" /> {loading ? "Posting..." : "Post donation"}
          </button>
        </form>
        {message && <p className="mt-3 text-sm font-medium text-primary">{message}</p>}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Your posted food</h4>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Live Updates Active
          </span>
        </div>
        <DonationList
          donations={donations}
          emptyText="Your posted donations will appear here with live tracking status."
          role="donor"
          onCancel={cancelDonation}
        />
      </div>
    </div>
  );
}

export function OrganizationWorkspace({ user }: { user: AppUser }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDonations() {
    try {
      const response = await apiRequest<DonationsResponse>("/donations");
      setDonations(response.donations);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load donations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user.orgStatus === "approved") {
      void loadDonations();
      const socket = getSocket();
      socket.emit("watch:donations");

      const handleCreated = (newDonation: Donation) => {
        setDonations((prev) => {
          if (prev.some((d) => d._id === newDonation._id)) return prev;
          toast.info(
            `New surplus food available: ${newDonation.foodName} (${newDonation.quantity} meals)`,
          );
          return [newDonation, ...prev];
        });
      };

      const handleUpdated = (updatedDonation: Donation) => {
        setDonations((prev) =>
          prev.map((d) => (d._id === updatedDonation._id ? updatedDonation : d)),
        );
      };

      socket.on("donation:created", handleCreated);
      socket.on("donation:updated", handleUpdated);

      const refreshTimer = window.setInterval(() => void loadDonations(), 30000);
      return () => {
        socket.off("donation:created", handleCreated);
        socket.off("donation:updated", handleUpdated);
        window.clearInterval(refreshTimer);
      };
    }
    setLoading(false);
  }, [user.orgStatus]);

  async function claim(id: string, quantityToClaim?: number) {
    try {
      const body = quantityToClaim ? JSON.stringify({ quantityToClaim }) : undefined;
      const res = await apiRequest<{ success: boolean; message: string; donation: Donation }>(
        `/donations/${id}/claim`,
        {
          method: "PATCH",
          body,
        },
      );
      setMessage(res.message || "Donation claimed! Coordinate pickup with the donor.");
      toast.success(res.message || "Donation claimed!");
      await loadDonations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to claim donation");
      toast.error(error instanceof Error ? error.message : "Unable to claim donation");
    }
  }

  async function updateStatus(id: string, status: "picked_up" | "delivered") {
    try {
      await apiRequest(`/donations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const label =
        status === "picked_up" ? "Food picked up & in transit" : "Food delivered & distributed";
      setMessage(label);
      toast.success(label);
      await loadDonations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update donation status");
    }
  }

  if (user.orgStatus !== "approved") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <Clock3 className="size-6 text-warning" />
          <div>
            <h4 className="font-semibold text-foreground">Verification Pending</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Food rescue opportunities, quantity claims, and live tracking activate once an
              administrator approves your organization.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="size-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Available surplus food</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Claim full batches or partial portions, coordinate pickup, and update live tracking
            milestones.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Radio className="size-3.5 animate-pulse" /> Live Rescue Radar
        </span>
      </div>

      {message && <p className="mt-3 text-sm font-medium text-primary">{message}</p>}

      {loading ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading donations...
        </p>
      ) : (
        <div className="mt-5">
          <DonationList
            donations={donations}
            emptyText="No available donations right now. You will be alerted in real time when new food is posted!"
            role="organization"
            onClaim={claim}
            onStatus={updateStatus}
          />
        </div>
      )}
    </div>
  );
}

export function DonationList({
  donations,
  emptyText,
  role,
  onClaim,
  onCancel,
  onStatus,
}: {
  donations: Donation[];
  emptyText: string;
  role: "donor" | "organization" | "admin";
  onClaim?: (id: string, quantityToClaim?: number) => void;
  onCancel?: (id: string) => void;
  onStatus?: (id: string, status: "picked_up" | "delivered") => void;
}) {
  const [splitDonationId, setSplitDonationId] = useState<string | null>(null);
  const [splitQuantity, setSplitQuantity] = useState<number>(10);

  if (donations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <article
          key={donation._id}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:border-primary/30"
        >
          {/* Photo Preview if available */}
          {donation.imageUrl && (
            <div className="relative mb-3.5 h-44 w-full overflow-hidden rounded-xl border border-border bg-muted/30">
              <img
                src={donation.imageUrl}
                alt={donation.foodName}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                <Camera className="size-3" /> Food Photo
              </div>
              {donation.originalQuantity && donation.originalQuantity > donation.quantity && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                  <Share2 className="size-3" /> Shared Batch ({donation.quantity} of{" "}
                  {donation.originalQuantity} meals)
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-foreground sm:text-lg">{donation.foodName}</h4>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {donation.quantity} Meals
                </span>
                {donation.foodType && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                      donation.foodType === "Veg"
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {donation.foodType === "Veg" ? (
                      <Salad className="size-3 text-emerald-600" />
                    ) : (
                      <Flame className="size-3 text-red-600" />
                    )}
                    {donation.foodType}
                  </span>
                )}
                {donation.eventType && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-foreground">
                    <Tag className="size-3 text-muted-foreground" />
                    {donation.eventType}
                  </span>
                )}
                {donation.claimedQuantity && (
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    Claimed: {donation.claimedQuantity}
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> {donation.pickupAddress},{" "}
                {donation.city}
              </p>
            </div>

            <StatusBadge status={donation.status} />
          </div>

          {/* Live Tracking Component */}
          <LiveTrackingSection donation={donation} role={role} />

          {/* Partial Split Claim Controls */}
          {splitDonationId === donation._id && role === "organization" && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Share2 className="size-3.5" /> Split Quantity: Claim Portion
                </h5>
                <button
                  type="button"
                  onClick={() => setSplitDonationId(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Total available:{" "}
                <span className="font-semibold text-foreground">{donation.quantity} meals</span>.
                The remaining portions will stay on the radar for other orphanages.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={donation.quantity - 1}
                  value={splitQuantity}
                  onChange={(e) =>
                    setSplitQuantity(
                      Math.max(1, Math.min(donation.quantity - 1, Number(e.target.value))),
                    )
                  }
                  className="w-28 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold text-foreground outline-none"
                />
                <span className="text-xs text-muted-foreground">meals</span>
                <button
                  type="button"
                  onClick={() => {
                    onClaim?.(donation._id, splitQuantity);
                    setSplitDonationId(null);
                  }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Confirm Claim ({splitQuantity} meals)
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            {donation.mapUrl && (
              <a
                href={donation.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <Navigation className="size-3.5 text-primary" /> Open GPS Directions
              </a>
            )}

            {/* Donor Actions */}
            {onCancel && donation.status === "available" && role === "donor" && (
              <button
                type="button"
                onClick={() => onCancel(donation._id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3.5 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/10"
              >
                Cancel donation
              </button>
            )}

            {/* Organization Actions */}
            {onClaim && donation.status === "available" && role === "organization" && (
              <>
                {new Date(donation.availableUntil).getTime() <= Date.now() ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground opacity-70 cursor-not-allowed"
                  >
                    <Clock3 className="size-4" /> Expired (Claim Disabled)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onClaim(donation._id)}
                      className="gradient-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
                    >
                      <PackageCheck className="size-4" /> Claim All ({donation.quantity} meals)
                    </button>
                    {donation.quantity > 5 && splitDonationId !== donation._id && (
                      <button
                        type="button"
                        onClick={() => {
                          setSplitDonationId(donation._id);
                          setSplitQuantity(Math.floor(donation.quantity / 2));
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                      >
                        <Share2 className="size-3.5" /> Claim Portion (Split)
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {onStatus &&
              donation.status === "claimed" &&
              (role === "organization" || role === "admin") && (
                <button
                  type="button"
                  onClick={() => onStatus(donation._id, "picked_up")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                >
                  <Truck className="size-3.5" /> Mark Picked Up (In Transit)
                </button>
              )}

            {onStatus &&
              donation.status === "picked_up" &&
              (role === "organization" || role === "admin") && (
                <button
                  type="button"
                  onClick={() => onStatus(donation._id, "delivered")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-3.5" /> Confirm Delivered
                </button>
              )}

            {donation.status === "delivered" && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-4" /> Food safely distributed
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Donation["status"] }) {
  const styles: Record<Donation["status"], { bg: string; text: string; label: string }> = {
    available: {
      bg: "bg-amber-500/15",
      text: "text-amber-700 dark:text-amber-400",
      label: "Available",
    },
    claimed: {
      bg: "bg-blue-500/15",
      text: "text-blue-700 dark:text-blue-400",
      label: "Rescue Approved",
    },
    picked_up: {
      bg: "bg-purple-500/15",
      text: "text-purple-700 dark:text-purple-400",
      label: "In Transit",
    },
    delivered: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Delivered",
    },
    cancelled: { bg: "bg-destructive/15", text: "text-destructive", label: "Cancelled" },
  };

  const current = styles[status] || styles.available;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${current.bg} ${current.text}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {current.label}
    </span>
  );
}

function PriorityBadge({ remainingMs, isExpired }: { remainingMs: number; isExpired: boolean }) {
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-0.5 text-[11px] font-bold text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        Expired
      </span>
    );
  }
  const hoursLeft = remainingMs / 3600000;
  if (hoursLeft < 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-600 animate-pulse">
        <span className="size-1.5 rounded-full bg-red-600" />
        High Priority (&lt;1h left)
      </span>
    );
  }
  if (hoursLeft < 3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Medium Priority (1–3h left)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
      <span className="size-1.5 rounded-full bg-emerald-600" />
      Normal Priority (3–5h left)
    </span>
  );
}

function LiveTrackingSection({
  donation,
  role,
}: {
  donation: Donation;
  role: "donor" | "organization" | "admin";
}) {
  const { status, availableUntil } = donation;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (status === "cancelled") {
    return (
      <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
        Tracking ended: donation was cancelled.
      </div>
    );
  }

  const stepKeys = ["available", "claimed", "picked_up", "delivered"];
  const currentIndex = stepKeys.indexOf(status);
  const remainingMs = new Date(availableUntil).getTime() - now;
  const isExpired = remainingMs <= 0;

  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const formattedCountdown = isExpired ? "Expired" : `${hours}h ${minutes}m ${seconds}s remaining`;

  const countdownColor = isExpired
    ? "text-destructive font-bold"
    : remainingMs < 3600000
      ? "text-red-500 font-bold animate-pulse"
      : remainingMs < 7200000
        ? "text-amber-500 font-semibold"
        : "text-emerald-600 font-semibold";

  return (
    <div className="mt-4 rounded-2xl border border-border/80 bg-secondary/30 p-4">
      {/* Header bar with Live indicator & countdown */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
        <div className="flex items-center gap-2">
          {status === "claimed" || status === "picked_up" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              LIVE TRACKING ACTIVE
            </span>
          ) : status === "delivered" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="size-3" /> RESCUE MISSION COMPLETED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock3 className="size-3.5" /> Awaiting Partner Claim
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <PriorityBadge remainingMs={remainingMs} isExpired={isExpired} />
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Freshness:</span>
            <span className={countdownColor}>{formattedCountdown}</span>
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mt-4">
        <div className="grid grid-cols-4 gap-2">
          {trackingSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`flex size-8 items-center justify-center rounded-full transition-all ${
                    isCompleted
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={`mt-2 block text-[11px] font-semibold ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {step.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Track Line */}
        <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (trackingSteps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Rescue Coordination Details */}
      {(donation.organization || donation.donor) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 text-xs shadow-xs">
          <div className="space-y-0.5">
            {donation.organization && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Rescue Partner:</span>{" "}
                {donation.organization.name} ({donation.organization.city})
              </p>
            )}
            {donation.donor && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Food Donor:</span>{" "}
                {donation.donor.name} ({donation.donor.city})
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {donation.organization?.phone && (
              <a
                href={`tel:${donation.organization.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                <Phone className="size-3.5" /> Call Organization: {donation.organization.phone}
              </a>
            )}

            {donation.donor?.phone && role === "organization" && (
              <a
                href={`tel:${donation.donor.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                <Phone className="size-3.5" /> Call Donor: {donation.donor.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {label}
      <input
        {...props}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal normal-case text-foreground outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
