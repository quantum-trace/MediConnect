"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminHeader } from "@/components/admin/header";
import { DoctorManagement, type Doctor } from "@/components/admin/doctor-management";
import { type CreatedDoctor } from "@/components/admin/create-doctor-dialog";
import { Loader2 } from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    const res = await fetch("/api/admin/doctors");
    if (!res.ok) throw new Error("Failed to load doctors");
    return res.json() as Promise<Doctor[]>;
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      setLoading(true);
      fetchDoctors()
        .then((data) => { setDoctors(data); setError(null); })
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    });
  }, [fetchDoctors]);

  const handleUpdate = useCallback(
    async (id: string, changes: { isApproved?: boolean; available?: boolean }) => {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Update failed");
      }
      const updated = await res.json();
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
      );
    },
    []
  );

  const handleInvite = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/doctors/${id}/invite`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to send invitation");
    }
    const updated = await res.json();
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );
  }, []);

  const handleCreated = useCallback((doctor: CreatedDoctor) => {
    setDoctors((prev) => [doctor, ...prev]);
  }, []);

  const handleUpdateLicenseNumber = useCallback(
    async (id: string, value: string | null) => {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNumber: value }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update license number");
      }
      const updated = await res.json();
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
      );
    },
    []
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm text-muted-foreground">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <p className="text-sm font-medium text-rose-500">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Make sure your account has Admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Doctor Management"
        subtitle={`${doctors.length} registered · ${doctors.filter((d) => d.isApproved).length} approved`}
      />

      <main className="p-6 lg:p-8">
        <DoctorManagement
          doctors={doctors}
          onUpdate={handleUpdate}
          onInvite={handleInvite}
          onCreated={handleCreated}
          onUpdateLicenseNumber={handleUpdateLicenseNumber}
        />
      </main>
    </div>
  );
}
