"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Mail, Calendar } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/date-utils";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) throw new Error("Failed to load admins");
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => fetchAdmins());
  }, [fetchAdmins]);

  const handleCreated = useCallback(() => {
    // When a new admin is invited, we might not have their user record yet,
    // so we just refetch. They will appear after they sign up.
    fetchAdmins();
  }, [fetchAdmins]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm text-muted-foreground">Loading admins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <p className="text-sm font-medium text-rose-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Admin Management"
        subtitle={`Showing ${admins.length} active platform administrators`}
      />

      <main className="p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-end">
          <CreateAdminDialog onCreated={handleCreated} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Admin
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-sm text-muted-foreground">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="transition-colors hover:bg-secondary/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/30">
                            <AvatarImage src={admin.imageUrl ?? ""} alt={admin.name} />
                            <AvatarFallback className="bg-rose-500/10 text-rose-500 text-xs font-semibold">
                              {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{admin.name}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-500">
                          <ShieldCheck className="h-3 w-3" />
                          ADMIN
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(admin.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
