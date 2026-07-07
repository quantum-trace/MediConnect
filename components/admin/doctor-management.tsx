"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Stethoscope,
  MoreHorizontal,
  Search,
  Filter,
  Send,
  RefreshCw,
  FilePen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DOCTOR_STATUS, DOCTOR_STATUS_LABELS, type DoctorStatusType } from "@/lib/constants";
import { CreateDoctorDialog } from "@/components/admin/create-doctor-dialog";
import { EditLicenseNumberDialog } from "@/components/admin/edit-license-number-dialog";
import type { AdminDoctorRow } from "@/lib/types/admin-doctor";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Doctor = AdminDoctorRow;

interface DoctorManagementProps {
  doctors: Doctor[];
  onUpdate: (id: string, changes: { isApproved?: boolean; available?: boolean }) => Promise<void>;
  onInvite: (id: string) => Promise<void>;
  onCreated: (doctor: Doctor) => void;
  onUpdateLicenseNumber: (id: string, value: string | null) => Promise<void>;
}

type FilterType = "all" | "approved" | "pending";

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<DoctorStatusType, string> = {
  [DOCTOR_STATUS.PENDING]: "bg-amber-500/10 text-amber-500",
  [DOCTOR_STATUS.INVITED]: "bg-blue-500/10 text-blue-500",
  [DOCTOR_STATUS.ACTIVE]: "bg-emerald-500/10 text-emerald-500",
  [DOCTOR_STATUS.SUSPENDED]: "bg-rose-500/10 text-rose-500",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function DoctorManagement({ doctors, onUpdate, onInvite, onCreated, onUpdateLicenseNumber }: DoctorManagementProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [licenseDialog, setLicenseDialog] = useState<{ doctor: Doctor } | null>(null);

  const filtered = doctors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "approved" && d.isApproved) ||
      (filter === "pending" && !d.isApproved);
    return matchesSearch && matchesFilter;
  });

  const handleToggle = (id: string, field: "isApproved" | "available", current: boolean) => {
    setLoadingId(id);
    startTransition(async () => {
      try {
        await onUpdate(id, { [field]: !current });
        toast.success("Doctor status updated.");
      } catch {
        toast.error("Failed to update doctor status. Please try again.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  const handleInvite = (id: string, name: string, isResend: boolean) => {
    setLoadingId(id);
    startTransition(async () => {
      try {
        await onInvite(id);
        toast.success(
          isResend
            ? `Invitation resent to Dr. ${name}.`
            : `Invitation sent to Dr. ${name}. They'll receive an email to activate their account.`
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send invitation";
        toast.error(message);
      } finally {
        setLoadingId(null);
      }
    });
  };

  const FILTER_TABS: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
  ];

  const canInvite = (status: string) =>
    status === DOCTOR_STATUS.PENDING || status === DOCTOR_STATUS.INVITED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-border/30 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Doctor Management</h2>
            <p className="text-sm text-muted-foreground">
              {doctors.length} registered &middot;{" "}
              {doctors.filter((d) => d.status === DOCTOR_STATUS.ACTIVE).length} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors..."
                className="h-9 w-52 rounded-xl border-border/30 bg-secondary/30 pl-8 text-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/30 gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {FILTER_TABS.find((f) => f.value === filter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border/30 bg-card/95 backdrop-blur-xl">
                {FILTER_TABS.map((tab) => (
                  <DropdownMenuItem
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={filter === tab.value ? "text-primary font-medium" : ""}
                  >
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <CreateDoctorDialog onCreated={onCreated} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/20">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Doctor
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                Specialty
              </th>
              <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                Activity
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No doctors match your search
                </td>
              </tr>
            ) : (
              filtered.map((doctor) => {
                const doctorStatus = doctor.status as DoctorStatusType;
                const isLoading = loadingId === doctor.id || isPending;

                return (
                  <tr
                    key={doctor.id}
                    className="transition-colors hover:bg-secondary/20"
                  >
                    {/* Doctor info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/30">
                          <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                          <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-xs font-semibold">
                            {doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.email || doctor.hospital}</p>
                        </div>
                      </div>
                    </td>

                    {/* Specialty */}
                    <td className="hidden px-5 py-4 md:table-cell">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {doctor.specialty.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    {/* Activity */}
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{doctor._count.appointments} appts</span>
                        <span className="text-border">&middot;</span>
                        <span>{doctor._count.prescriptions} rx</span>
                        <span className="text-border">&middot;</span>
                        <span>₹{doctor.consultationFee}/visit</span>
                      </div>
                    </td>

                    {/* Status badges */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Badge
                          className={`w-fit h-5 rounded-md px-2 text-[10px] font-semibold ${
                            STATUS_STYLES[doctorStatus] ?? "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {DOCTOR_STATUS_LABELS[doctorStatus] ?? doctorStatus}
                        </Badge>
                        {doctor.status === DOCTOR_STATUS.ACTIVE && (
                          <Badge
                            className={`w-fit h-5 rounded-md px-2 text-[10px] font-semibold ${
                              doctor.available
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {doctor.available ? "Available" : "Unavailable"}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            disabled={isLoading}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border-border/30 bg-card/95 backdrop-blur-xl"
                        >
                          {/* Invitation actions — only for PENDING / INVITED */}
                          {canInvite(doctor.status) && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleInvite(
                                    doctor.id,
                                    doctor.name,
                                    doctor.status === DOCTOR_STATUS.INVITED
                                  )
                                }
                                className="text-blue-500 focus:text-blue-500"
                              >
                                {doctor.status === DOCTOR_STATUS.INVITED ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend Invitation
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Invitation
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}

                          {/* Approval toggle */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggle(doctor.id, "isApproved", doctor.isApproved)
                            }
                            className={
                              doctor.isApproved
                                ? "text-rose-500 focus:text-rose-500"
                                : "text-emerald-500 focus:text-emerald-500"
                            }
                          >
                            {doctor.isApproved ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Revoke Approval
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve Doctor
                              </>
                            )}
                          </DropdownMenuItem>

                          {/* Availability toggle — only for ACTIVE doctors */}
                          {doctor.status === DOCTOR_STATUS.ACTIVE && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggle(doctor.id, "available", doctor.available)
                              }
                            >
                              {doctor.available ? "Mark Unavailable" : "Mark Available"}
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setLicenseDialog({ doctor })}
                            className="text-primary focus:text-primary"
                          >
                            <FilePen className="mr-2 h-4 w-4" />
                            Edit License Number
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* License number edit dialog — rendered once, keyed to the selected doctor */}
      {licenseDialog && (
        <EditLicenseNumberDialog
          open
          doctorName={licenseDialog.doctor.name}
          currentValue={licenseDialog.doctor.licenseNumber}
          onSave={async (value) => {
            await onUpdateLicenseNumber(licenseDialog.doctor.id, value);
            toast.success(`License number updated for Dr. ${licenseDialog.doctor.name}.`);
          }}
          onClose={() => setLicenseDialog(null)}
        />
      )}
    </motion.div>
  );
}
