"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Stethoscope } from "lucide-react";
import { toast } from "sonner";

export function OnboardingClient() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"PATIENT" | "DOCTOR" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selectedRole) return;

    try {
      setLoading(true);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to save role");
      }

      toast.success("Profile saved! Redirecting…");

      if (selectedRole === "DOCTOR") {
        router.push("/doctor");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold mb-4">Complete Your Profile</h1>
          <p className="text-zinc-400 text-lg">
            Choose how you want to use MediConnect
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setSelectedRole("PATIENT")}
            className={`rounded-2xl border p-8 text-left transition-all duration-300 ${
              selectedRole === "PATIENT"
                ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-cyan-500/10 p-4">
                <User className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Patient</h2>
                <p className="text-zinc-400">Book appointments and manage healthcare</p>
              </div>
            </div>
            <ul className="space-y-3 text-zinc-300">
              <li>• Book doctor appointments</li>
              <li>• Manage medical history</li>
              <li>• Get AI health assistance</li>
              <li>• Track prescriptions</li>
            </ul>
          </button>

          <button
            onClick={() => setSelectedRole("DOCTOR")}
            className={`rounded-2xl border p-8 text-left transition-all duration-300 ${
              selectedRole === "DOCTOR"
                ? "border-purple-400 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-purple-500/10 p-4">
                <Stethoscope className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Doctor</h2>
                <p className="text-zinc-400">Manage patients and appointments</p>
              </div>
            </div>
            <ul className="space-y-3 text-zinc-300">
              <li>• Manage appointment slots</li>
              <li>• Handle patient consultations</li>
              <li>• Track earnings and analytics</li>
              <li>• Build your professional profile</li>
            </ul>
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-10 py-4 text-lg font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
