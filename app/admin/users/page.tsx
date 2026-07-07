"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Mail,
  Calendar,
  Loader2,
  ShieldCheck,
  Stethoscope,
  User,
  
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminHeader } from "@/components/admin/header";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import { USER_ROLE } from "@/lib/constants";

const ROLE_STYLES: Record<string, string> = {
  PATIENT: "bg-primary/10 text-primary",
  DOCTOR:  "bg-violet-500/10 text-violet-500",
  ADMIN:   "bg-rose-500/10 text-rose-500",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  PATIENT: User,
  DOCTOR:  Stethoscope,
  ADMIN:   ShieldCheck,
};

const ROLE_FILTERS = [
  { label: "All Roles", value: "all" },
  { label: "Patients",  value: USER_ROLE.PATIENT },
  { label: "Doctors",   value: USER_ROLE.DOCTOR },
  { label: "Admins",    value: USER_ROLE.ADMIN },
] as const;

type RoleFilter = "all" | "PATIENT" | "DOCTOR" | "ADMIN";

interface UserRow {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
  createdAt: string;
  _count: { appointments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error(await res.text());
      setUsers(await res.json());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    Promise.resolve().then(() => fetchUsers());
  }, [fetchUsers]);

  return (
    <div className="min-h-screen">
      <AdminHeader title="Users" subtitle="All registered platform users" />
      <main className="p-6 lg:p-8">
        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total",    value: users.length,                                     color: "text-foreground" },
            { label: "Patients", value: users.filter((u) => u.role === USER_ROLE.PATIENT).length, color: "text-primary" },
            { label: "Doctors",  value: users.filter((u) => u.role === USER_ROLE.DOCTOR).length,  color: "text-violet-500" },
            { label: "Admins",   value: users.filter((u) => u.role === USER_ROLE.ADMIN).length,   color: "text-rose-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 p-5 backdrop-blur-xl"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="h-9 rounded-xl border-border/30 bg-secondary/30 pl-9 text-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer h-9 rounded-xl border-border/30 gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                {ROLE_FILTERS.find((f) => f.value === roleFilter)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border/30 bg-card/95 backdrop-blur-xl">
              {ROLE_FILTERS.map((f) => (
                <DropdownMenuItem
                  key={f.value}
                  onClick={() => setRoleFilter(f.value as RoleFilter)}
                  className={`cursor-pointer ${roleFilter === f.value ? "text-primary font-medium" : ""}`}
                >
                  {f.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/30 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/20">
                    {["User", "Role", "Appointments", "Joined", ""].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const RoleIcon = ROLE_ICONS[u.role] ?? User;
                      return (
                        <tr key={u.id} className="transition-colors hover:bg-secondary/20">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-border/30">
                                <AvatarImage src={u.imageUrl ?? ""} alt={u.name} />
                                <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20 text-xs font-semibold">
                                  {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{u.name}</p>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge className={`w-fit h-5 rounded-md px-2 text-[10px] font-semibold ${ROLE_STYLES[u.role] ?? "bg-secondary text-muted-foreground"}`}>
                              <RoleIcon className="mr-1 h-3 w-3" />
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {u._count.appointments}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Badge className="cursor-pointer bg-secondary/50 text-muted-foreground hover:bg-secondary/70 transition-colors">
                              View
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
