"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Globe,
  Lock,
  Mail,
  Save,
  Settings,
  Shield,
  Sliders,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminHeader } from "@/components/admin/header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SETTING_SECTIONS = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "platform", label: "Platform", icon: Sliders },
] as const;

type SectionId = (typeof SETTING_SECTIONS)[number]["id"];

interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  timezone: string;
  maintenanceMode: boolean;
}

interface NotificationSettings {
  emailOnNewAppointment: boolean;
  emailOnCancellation: boolean;
  emailOnNewDoctor: boolean;
  systemAlerts: boolean;
}

interface SecuritySettings {
  requireDoctorApproval: boolean;
  twoFactorRequired: boolean;
  sessionTimeoutMinutes: number;
}

interface PlatformSettings {
  allowPatientSelfCancel: boolean;
  maxFutureDaysBookable: number;
  consultationFeeMin: number;
  consultationFeeMax: number;
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState<GeneralSettings>({
    platformName: "MediConnect",
    supportEmail: "support@mediconnect.health",
    timezone: "UTC",
    maintenanceMode: false,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailOnNewAppointment: true,
    emailOnCancellation: true,
    emailOnNewDoctor: true,
    systemAlerts: true,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    requireDoctorApproval: true,
    twoFactorRequired: false,
    sessionTimeoutMinutes: 60,
  });

  const [platform, setPlatform] = useState<PlatformSettings>({
    allowPatientSelfCancel: true,
    maxFutureDaysBookable: 30,
    consultationFeeMin: 100,
    consultationFeeMax: 5000,
  });

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved successfully.");
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Settings" subtitle="Platform configuration and preferences" />
      <main className="p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Nav */}
          <nav className="flex shrink-0 flex-row gap-1 lg:w-52 lg:flex-col">
            {SETTING_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-rose-500/10 text-rose-500"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:block">{section.label}</span>
                  <span className="lg:hidden">{section.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-6 backdrop-blur-xl"
          >
            {activeSection === "general" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">General Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Basic platform configuration.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="platform-name"
                        value={general.platformName}
                        onChange={(e) =>
                          setGeneral((p) => ({ ...p, platformName: e.target.value }))
                        }
                        className="rounded-xl border-border/30 bg-secondary/30 pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="support-email"
                        type="email"
                        value={general.supportEmail}
                        onChange={(e) =>
                          setGeneral((p) => ({ ...p, supportEmail: e.target.value }))
                        }
                        className="rounded-xl border-border/30 bg-secondary/30 pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={general.timezone}
                      onChange={(e) =>
                        setGeneral((p) => ({ ...p, timezone: e.target.value }))
                      }
                      className="rounded-xl border-border/30 bg-secondary/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 p-4">
                  <div>
                    <p className="text-sm font-medium">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Temporarily disable platform access for all users.
                    </p>
                  </div>
                  <Switch
                    checked={general.maintenanceMode}
                    onCheckedChange={(v) =>
                      setGeneral((p) => ({ ...p, maintenanceMode: v }))
                    }
                  />
                </div>
              </section>
            )}

            {activeSection === "notifications" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Notification Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Control which events trigger admin notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "emailOnNewAppointment" as const,
                      label: "New Appointment",
                      desc: "Receive email when a patient books an appointment.",
                    },
                    {
                      key: "emailOnCancellation" as const,
                      label: "Cancellation",
                      desc: "Receive email when an appointment is cancelled.",
                    },
                    {
                      key: "emailOnNewDoctor" as const,
                      label: "New Doctor Registration",
                      desc: "Receive email when a new doctor registers.",
                    },
                    {
                      key: "systemAlerts" as const,
                      label: "System Alerts",
                      desc: "Receive critical system health notifications.",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(v) =>
                          setNotifications((p) => ({ ...p, [item.key]: v }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "security" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Security Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage platform security policies.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "requireDoctorApproval" as const,
                      label: "Require Doctor Approval",
                      desc: "New doctors must be approved before accepting appointments.",
                    },
                    {
                      key: "twoFactorRequired" as const,
                      label: "Require 2FA for Admins",
                      desc: "Enforce two-factor authentication for all admin accounts.",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={security[item.key]}
                        onCheckedChange={(v) =>
                          setSecurity((p) => ({ ...p, [item.key]: v }))
                        }
                      />
                    </div>
                  ))}

                  <div className="space-y-2 rounded-xl border border-border/30 bg-secondary/20 p-4">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    </div>
                    <Input
                      id="session-timeout"
                      type="number"
                      min={5}
                      max={1440}
                      value={security.sessionTimeoutMinutes}
                      onChange={(e) =>
                        setSecurity((p) => ({
                          ...p,
                          sessionTimeoutMinutes: parseInt(e.target.value, 10) || 60,
                        }))
                      }
                      className="w-32 rounded-xl border-border/30 bg-secondary/30"
                    />
                  </div>
                </div>
              </section>
            )}

            {activeSection === "platform" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Platform Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure booking rules and consultation parameters.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 p-4">
                  <div>
                    <p className="text-sm font-medium">Allow Patient Self-Cancellation</p>
                    <p className="text-xs text-muted-foreground">
                      Patients can cancel their own appointments without admin action.
                    </p>
                  </div>
                  <Switch
                    checked={platform.allowPatientSelfCancel}
                    onCheckedChange={(v) =>
                      setPlatform((p) => ({ ...p, allowPatientSelfCancel: v }))
                    }
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-border/30 bg-secondary/20 p-4">
                    <Label htmlFor="max-days">Max Future Days Bookable</Label>
                    <Input
                      id="max-days"
                      type="number"
                      min={1}
                      max={365}
                      value={platform.maxFutureDaysBookable}
                      onChange={(e) =>
                        setPlatform((p) => ({
                          ...p,
                          maxFutureDaysBookable: parseInt(e.target.value, 10) || 30,
                        }))
                      }
                      className="rounded-xl border-border/30 bg-secondary/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      How far in advance patients can book.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-border/30 bg-secondary/20 p-4">
                    <Label>Consultation Fee Range (₹)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={platform.consultationFeeMin}
                        onChange={(e) =>
                          setPlatform((p) => ({
                            ...p,
                            consultationFeeMin: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        placeholder="Min"
                        className="rounded-xl border-border/30 bg-secondary/30"
                      />
                      <span className="text-muted-foreground">–</span>
                      <Input
                        type="number"
                        min={0}
                        value={platform.consultationFeeMax}
                        onChange={(e) =>
                          setPlatform((p) => ({
                            ...p,
                            consultationFeeMax: parseInt(e.target.value, 10) || 5000,
                          }))
                        }
                        placeholder="Max"
                        className="rounded-xl border-border/30 bg-secondary/30"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="cursor-pointer gap-2 rounded-xl bg-linear-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-shadow"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
