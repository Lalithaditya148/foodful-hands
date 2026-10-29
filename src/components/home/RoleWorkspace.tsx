import { CheckCircle2, LoaderCircle, Mail, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth, type AppUser, type OrgStatus } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import {
  DonorWorkspace,
  OrganizationWorkspace,
  DonationList,
  type Donation,
} from "@/components/home/DonationWorkspace";
import { getSocket } from "@/lib/socket";

type UsersResponse = { success: boolean; users: AppUser[] };

type ContactMessage = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: "unread" | "resolved";
  createdAt: string;
};

export function RoleWorkspace() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section className="border-y border-border bg-secondary/30 py-10">
      <div className="container-page">
        {user.role === "admin" ? <AdminWorkspace /> : <MemberWorkspace user={user} />}
      </div>
    </section>
  );
}

function MemberWorkspace({ user }: { user: AppUser }) {
  const isOrganization = user.role === "organization";
  return (
    <div>
      <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
        Your workspace
      </span>
      <h2 className="mt-2 text-2xl font-bold text-foreground">
        {isOrganization ? "Organization coordination" : "Donor coordination"}
      </h2>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        {isOrganization
          ? user.orgStatus === "approved"
            ? "Your organization is approved and ready to coordinate food pickups."
            : user.orgStatus === "rejected"
              ? "Your organization needs support before it can receive donations."
              : "Your organization profile is waiting for admin verification."
          : "Post surplus food and help route it to nearby homes."}
      </p>
      {isOrganization ? <OrganizationWorkspace user={user} /> : <DonorWorkspace />}
    </div>
  );
}

function AdminWorkspace() {
  const { setOrgStatus } = useAuth();
  const [organizations, setOrganizations] = useState<AppUser[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"approvals" | "tracking" | "messages">("approvals");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadOrganizations() {
    try {
      const response = await apiRequest<UsersResponse>("/users");
      setOrganizations(response.users.filter((candidate) => candidate.role === "organization"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load organizations");
    }
  }

  async function loadDonations() {
    try {
      const response = await apiRequest<{ success: boolean; donations: Donation[] }>("/donations");
      setDonations(response.donations);
    } catch {
      // background fetch error
    }
  }

  async function loadContactMessages() {
    try {
      const response = await apiRequest<{ success: boolean; messages: ContactMessage[] }>(
        "/contact",
      );
      setContactMessages(response.messages);
    } catch {
      // background fetch error
    }
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOrganizations(), loadDonations(), loadContactMessages()]).finally(() =>
      setLoading(false),
    );

    // Listen for live updates via Socket.IO
    const socket = getSocket();
    socket.emit("watch:donations");

    const handleCreated = (newDonation: Donation) => {
      setDonations((prev) => [newDonation, ...prev]);
    };
    const handleUpdated = (updatedDonation: Donation) => {
      setDonations((prev) =>
        prev.map((d) => (d._id === updatedDonation._id ? updatedDonation : d)),
      );
    };

    socket.on("donation:created", handleCreated);
    socket.on("donation:updated", handleUpdated);

    const timer = setInterval(() => {
      void loadOrganizations();
      void loadDonations();
      void loadContactMessages();
    }, 25000);

    return () => {
      socket.off("donation:created", handleCreated);
      socket.off("donation:updated", handleUpdated);
      clearInterval(timer);
    };
  }, []);

  async function updateStatus(userId: string, status: OrgStatus) {
    const result = await setOrgStatus(userId, status);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(`Organization ${status}.`);
    void loadOrganizations();
  }

  async function toggleMessageStatus(id: string, currentStatus: "unread" | "resolved") {
    try {
      const newStatus = currentStatus === "unread" ? "resolved" : "unread";
      await apiRequest(`/contact/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setContactMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m)),
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to update message status");
    }
  }

  async function deleteMessage(id: string) {
    try {
      await apiRequest(`/contact/${id}`, { method: "DELETE" });
      setContactMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to delete message");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
            Admin command center
          </span>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Platform Administration</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Approve partner homes, monitor live food rescues, and resolve user contact inquiries.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
          <ShieldCheck className="size-4" /> Admin verified
        </span>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "approvals"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          Organization Approvals ({organizations.filter((o) => o.orgStatus === "pending").length}{" "}
          Pending)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tracking")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "tracking"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Live Food Rescue Tracking ({donations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === "messages"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Mail className="size-3.5" />
          Contact Inquiries ({contactMessages.filter((m) => m.status === "unread").length} Unread)
        </button>
      </div>

      {message && (
        <p
          className={`mt-4 text-sm font-medium ${message.toLowerCase().includes("unable") || message.toLowerCase().includes("error") ? "text-danger" : "text-primary"}`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Loading data...
        </p>
      ) : activeTab === "approvals" ? (
        organizations.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No organization accounts found.</p>
        ) : (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {organizations.map((organization) => (
              <article
                key={organization.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{organization.name}</h3>
                      {organization.orgType && (
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                          {organization.orgType.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    {organization.managerName && (
                      <p className="mt-1 text-xs font-medium text-foreground/90">
                        Manager: {organization.managerName}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {organization.email} · {organization.phone} · {organization.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Address: {organization.address}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      organization.orgStatus === "approved"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : organization.orgStatus === "rejected"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {organization.orgStatus ?? "pending"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void updateStatus(organization.id, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90"
                  >
                    <CheckCircle2 className="size-3.5" /> Approve Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateStatus(organization.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
                  >
                    <XCircle className="size-3.5" /> Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : activeTab === "tracking" ? (
        <div className="mt-6">
          <DonationList
            donations={donations}
            emptyText="No food rescue donations currently on the network."
            role="admin"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {contactMessages.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No contact inquiries submitted yet.
            </p>
          ) : (
            contactMessages.map((msg) => (
              <article
                key={msg._id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{msg.name}</h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          msg.status === "resolved"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Email:{" "}
                      <a href={`mailto:${msg.email}`} className="text-primary hover:underline">
                        {msg.email}
                      </a>{" "}
                      · Phone:{" "}
                      <a href={`tel:${msg.phone}`} className="text-primary hover:underline">
                        {msg.phone}
                      </a>{" "}
                      · {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleMessageStatus(msg._id, msg.status)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
                    >
                      <CheckCircle2 className="size-3.5 text-primary" />
                      {msg.status === "unread" ? "Mark Resolved" : "Mark Unread"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteMessage(msg._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-secondary/40 p-3.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
