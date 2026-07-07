"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  User,
  Bell,
  Shield,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Check,
  Lock,
} from "lucide-react";

// ── Section nav config ────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "profile",       label: "Profile",            icon: User,    desc: "Your account info"       },
  { id: "personal",      label: "Personal Details",   icon: Shield,  desc: "Health & contact info"   },
  { id: "appearance",    label: "Appearance",         icon: Sun,     desc: "Theme & display"         },
  { id: "notifications", label: "Notifications",      icon: Bell,    desc: "Alert preferences"       },
  { id: "security",      label: "Privacy & Security", icon: Lock,    desc: "Password & 2FA"          },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const THEME_OPTIONS = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

// ── Shared row primitive ──────────────────────────────────────────────────────

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {value && <p className="mt-0.5 text-xs text-muted-foreground">{value}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Section content panels ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfilePanel({ user, openUserProfile }: { user: any; openUserProfile: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-6 border-b border-border/30">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="bg-linear-to-br from-primary to-accent text-lg text-white font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold">{user?.fullName}</p>
          <Badge className="mt-1 bg-primary/10 text-primary text-xs">Patient</Badge>
        </div>
      </div>

      <div>
        <Row label="Full Name" value={user?.fullName || "—"} />
        <Row
          label="Email Address"
          value={user?.primaryEmailAddress?.emailAddress || "—"}
          action={<Badge className="bg-emerald-500/10 text-emerald-500 text-xs">Verified</Badge>}
        />
      </div>

      <Button
        variant="outline"
        className="gap-2 rounded-xl border-border/50 cursor-pointer"
        onClick={openUserProfile}
      >
        Manage full profile <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function PersonalDetailsPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ age: "", gender: "", phone: "", address: "", bloodType: "" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [genderOptions, setGenderOptions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/options?category=GENDER").then(r => r.json()).then(d => { if (Array.isArray(d)) setGenderOptions(d); }).catch(console.error);
    fetch("/api/patient/profile").then(r => r.json()).then(d => {
      if (!d.error) {
        setProfile(d);
        setFormData({ age: d.age?.toString() || "", gender: d.gender || "", phone: d.phone || "", address: d.address || "", bloodType: d.bloodType || "" });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/patient/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) { setProfile(await res.json()); setIsEditing(false); }
  };

  const inputCls = "w-full rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40";

  if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>;

  if (isEditing) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Age</label>
          <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className={inputCls} placeholder="e.g. 34" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Gender</label>
          <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className={inputCls}>
            <option value="">Select…</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {genderOptions.map((o: any) => <option key={o.key} value={o.value}>{o.value}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Phone</label>
        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="+1 (555) 000-0000" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Address</label>
        <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputCls} placeholder="Your full address" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Blood Type</label>
        <input type="text" value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className={inputCls} placeholder="e.g. O+" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} className="flex-1 rounded-xl cursor-pointer" size="sm">Save Changes</Button>
        <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl cursor-pointer" size="sm">Cancel</Button>
      </div>
    </div>
  );

  return (
    <div>
      <Row label="Age"        value={profile?.age ? `${profile.age} years old` : "Not set"} />
      <Row label="Gender"     value={profile?.gender     || "Not set"} />
      <Row label="Phone"      value={profile?.phone      || "Not set"} />
      <Row label="Address"    value={profile?.address    || "Not set"} />
      <Row label="Blood Type" value={profile?.bloodType  || "Not set"} />
      <div className="mt-4">
        <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl border-border/50 cursor-pointer" size="sm">
          Edit Personal Details
        </Button>
      </div>
    </div>
  );
}

function AppearancePanel({ theme, setTheme, mounted }: { theme: string | undefined; setTheme: (t: string) => void; mounted: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Theme</p>
      <div className="grid grid-cols-3 gap-3 max-w-sm">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = mounted && theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200",
                isActive ? "border-primary/50 bg-primary/10" : "border-border/40 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40"
              )}
            >
              {isActive && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/notifications").then(r => r.json()).then(d => { if (Array.isArray(d)) setOptions(d); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggle = async (key: string, current: boolean) => {
    const next = !current;
    setOptions(p => p.map(o => o.key === key ? { ...o, enabled: next } : o));
    try {
      await fetch("/api/settings/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, enabled: next }) });
    } catch { setOptions(p => p.map(o => o.key === key ? { ...o, enabled: current } : o)); }
  };

  if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>;

  return (
    <div>
      {options.map(item => (
        <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-border/30 last:border-0">
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
          </div>
          <button
            onClick={() => toggle(item.key, item.enabled)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              item.enabled ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-secondary/60 text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {item.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      ))}
    </div>
  );
}

function SecurityPanel({ lastChangedText, openUserProfile }: { lastChangedText: string; openUserProfile: () => void }) {
  return (
    <div>
      <Row
        label="Password"
        value={lastChangedText}
        action={
          <Button variant="outline" size="sm" className="cursor-pointer rounded-xl text-xs border-border/50" onClick={openUserProfile}>
            Change
          </Button>
        }
      />
      <Row
        label="Two-Factor Authentication"
        value="Add extra security to your account"
        action={
          <Button variant="outline" size="sm" className="cursor-pointer rounded-xl text-xs border-border/50" onClick={openUserProfile}>
            Enable 2FA
          </Button>
        }
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<SectionId>("profile");

  useEffect(() => { Promise.resolve().then(() => setMounted(true)); }, []);

  const lastChangedText = user?.updatedAt
    ? `Last updated ${formatDistanceToNow(user.updatedAt, { addSuffix: true })}`
    : "Recently updated";

  const activeSection = SECTIONS.find(s => s.id === active)!;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </motion.div>

      {/* Body: nav + panel */}
      <div className="flex min-h-0 flex-1 gap-0 rounded-2xl border border-border/40 bg-card/40 overflow-hidden">

        {/* ── Left nav ── */}
        <nav className="flex w-56 shrink-0 flex-col border-r border-border/40 bg-card/30 py-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActive(section.id)}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer",
                  isActive ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/30"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="settings-nav-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-primary/10" : "bg-secondary/30 group-hover:bg-secondary/50"
                )}>
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium leading-tight", isActive && "text-foreground")}>{section.label}</p>
                  <p className="text-[10px] text-muted-foreground/50 leading-tight mt-0.5 truncate">{section.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* ── Right content panel ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 p-8"
            >
              {/* Panel header */}
              <div className="mb-6 pb-5 border-b border-border/30">
                <h2 className="text-base font-semibold">{activeSection.label}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{activeSection.desc}</p>
              </div>

              {/* Panel content */}
              {active === "profile"       && <ProfilePanel user={user} openUserProfile={openUserProfile} />}
              {active === "personal"      && <PersonalDetailsPanel />}
              {active === "appearance"    && <AppearancePanel theme={theme} setTheme={setTheme} mounted={mounted} />}
              {active === "notifications" && <NotificationsPanel />}
              {active === "security"      && <SecurityPanel lastChangedText={lastChangedText} openUserProfile={openUserProfile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
