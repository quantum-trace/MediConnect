"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorHeader } from "@/components/doctor/header";
import {
  User,
  Bell,
  Shield,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Check,
  Loader2,
  X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string | null;
  email: string | null;
  hospital: string;
  experience: number;
  consultationFee: number;
  imageUrl: string;
}

interface SpecialtyOption {
  id: string;
  key: string;
  value: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 border-b border-border/30 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// Inline-editable row supporting text inputs, number inputs and select dropdowns
function EditableRow({
  label,
  value,
  displayValue,
  editType = "text",
  inputType = "text",
  options,
  onSave,
  action,
  locked = false,
}: {
  label: string;
  value: string;
  displayValue?: string;
  editType?: "text" | "select";
  inputType?: "text" | "number";
  options?: SpecialtyOption[];
  onSave?: (val: string) => Promise<void>;
  action?: React.ReactNode;
  /** When true the row shows the value but hides all edit controls permanently. */
  locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setDraft(value));
  }, [value]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(draft);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const resolvedDisplay = displayValue ?? value;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {editing ? (
          <div className="mt-1.5">
          <div className="flex items-center gap-2">
            {editType === "select" && options ? (
              <Select value={draft} onValueChange={setDraft}>
                <SelectTrigger className="h-8 w-52 rounded-lg text-xs border-border/50">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key} className="text-xs">
                      {opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={inputType}
                min={inputType === "number" ? 1 : undefined}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8 w-52 rounded-lg text-xs border-border/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
            )}
            <Button
              size="sm"
              className="h-7 rounded-lg px-3 text-xs"
              onClick={handleSave}
              disabled={saving || draft === value}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-lg p-0"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          {saveError && (
            <p className="mt-1 text-xs text-destructive">{saveError}</p>
          )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">{resolvedDisplay || "—"}</p>
        )}
      </div>
      {!editing && !locked &&
        (action ?? (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-1 text-primary shrink-0"
            onClick={() => setEditing(true)}
          >
            Edit <ChevronRight className="h-3 w-3" />
          </Button>
        ))}
      {!editing && locked && (
        <Badge className="bg-muted text-muted-foreground text-xs shrink-0 select-none">
          Locked
        </Badge>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorSettingsPage() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [specialtyOptions, setSpecialtyOptions] = useState<SpecialtyOption[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  useEffect(() => { Promise.resolve().then(() => setMounted(true)); }, []);

  // Fetch doctor profile and specialty options in parallel
  useEffect(() => {
    const fetchData = async () => {
      const [profileRes, optionsRes] = await Promise.all([
        fetch("/api/doctor/profile"),
        fetch("/api/options?category=SPECIALTY"),
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (optionsRes.ok) setSpecialtyOptions(await optionsRes.json());
      setLoadingProfile(false);
    };
    fetchData();
  }, []);

  const patchProfile = useCallback(
    async (field: keyof Pick<DoctorProfile, "name" | "specialty" | "licenseNumber" | "consultationFee">, value: string) => {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Save failed (${res.status})`);
      }
      const updated: DoctorProfile = await res.json();
      setProfile(updated);
    },
    []
  );

  const specialtyLabel = specialtyOptions.find((o) => o.key === profile?.specialty)?.value ?? profile?.specialty ?? "—";

  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your profile and preferences.</p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* Profile */}
          <Section icon={User} title="Profile" description="Your professional information">
            <div className="mb-5 flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/30">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Doctor"} />
                <AvatarFallback className="bg-linear-to-br from-primary to-accent text-lg font-semibold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {profile?.name ? `Dr. ${profile.name}` : user?.fullName ? `Dr. ${user.fullName}` : "Doctor"}
                </p>
                <Badge className="mt-1 bg-emerald-500/20 text-emerald-500">Verified Physician</Badge>
              </div>
            </div>

            {loadingProfile ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
              </div>
            ) : (
              <>
                <EditableRow
                  label="Full Name"
                  value={profile?.name ?? user?.fullName ?? ""}
                  onSave={(val) => patchProfile("name", val)}
                />
                <EditableRow
                  label="Email Address"
                  value={user?.primaryEmailAddress?.emailAddress ?? "—"}
                  action={<Badge className="bg-emerald-500/10 text-emerald-500 text-xs">Verified</Badge>}
                />
                <EditableRow
                  label="Specialty"
                  value={profile?.specialty ?? ""}
                  displayValue={specialtyLabel}
                  editType="select"
                  options={specialtyOptions}
                  onSave={(val) => patchProfile("specialty", val)}
                />
                <EditableRow
                  label="License Number"
                  value={profile?.licenseNumber ?? ""}
                  onSave={(val) => patchProfile("licenseNumber", val)}
                  locked={!!profile?.licenseNumber}
                />
                <EditableRow
                  label="Consultation Fee"
                  value={profile?.consultationFee?.toString() ?? ""}
                  displayValue={profile?.consultationFee != null ? `₹${profile.consultationFee}` : "—"}
                  inputType="number"
                  onSave={(val) => patchProfile("consultationFee", val)}
                />
              </>
            )}
          </Section>

          {/* Appearance */}
          <Section icon={Sun} title="Appearance" description="Customize the look and feel">
            <p className="mb-3 text-sm font-medium">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = mounted && theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                      isActive
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/30 bg-secondary/20 hover:border-primary/30 hover:bg-secondary/40"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Notifications */}
          <Section icon={Bell} title="Notifications" description="Control appointment notifications">
            {[
              { id: "email", label: "Email Notifications", desc: "Receive appointment updates in your inbox" },
              { id: "push", label: "Push Notifications", desc: "Get real-time alerts on your device" },
            ].map((item) => {
              const isEnabled = notifications[item.id as keyof typeof notifications];
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-border/30 py-4 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id as keyof typeof prev],
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isEnabled ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </Section>

          {/* Security */}
          <Section icon={Shield} title="Privacy & Security" description="Keep your account secure">
            <EditableRow
              label="Password"
              value="Managed via Clerk"
              action={
                <Button variant="outline" size="sm" className="cursor-pointer rounded-xl text-xs border-border/30" onClick={() => openUserProfile()}>
                  Change
                </Button>
              }
            />
            <EditableRow
              label="Two-Factor Authentication"
              value="Extra security for your account"
              action={
                <Button variant="outline" size="sm" className="cursor-pointer rounded-xl text-xs border-border/30" onClick={() => openUserProfile()}>
                  Enable 2FA
                </Button>
              }
            />
          </Section>
        </div>
      </main>
    </div>
  );
}
