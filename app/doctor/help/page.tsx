"use client";

import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { DoctorHeader } from "@/components/doctor/header";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How do I confirm or reject an appointment?",
    a: "In the Appointments page, each pending appointment has a green check (confirm) and red X (reject) button. Click the appropriate button to update the status.",
  },
  {
    q: "How do I write a prescription?",
    a: "After marking an appointment as Completed, a 'Write Rx' button appears. Click it to open the prescription editor where you can add medications, diagnosis, and follow-up notes.",
  },
  {
    q: "How do I set my availability?",
    a: "Go to the Availability page. Toggle days on/off and click individual time slots to mark them as available. Click 'Save Changes' to update.",
  },
  {
    q: "How do I join a video consultation?",
    a: "When an appointment is Confirmed and the patient is ready, a 'Join Call' button will be active on the appointment card. Click it to enter the video room.",
  },
  {
    q: "How are my earnings calculated?",
    a: "Your earnings are based on your consultation fee multiplied by completed appointments. The platform deducts a small service fee before remittance.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button className="flex w-full cursor-pointer items-center justify-between py-4 text-left" onClick={() => setOpen(!open)}>
        <span className="font-medium">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

export default function DoctorHelpPage() {
  return (
    <div className="min-h-screen">
      <DoctorHeader />
      <main className="p-6 lg:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="mt-1 text-muted-foreground">Resources and support for physicians.</p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MessageSquare, label: "Live Chat",  desc: "Chat with support",      color: "text-primary",    bg: "bg-primary/10" },
              { icon: Mail,          label: "Email",      desc: "doctors@mediconnect.io", color: "text-violet-500", bg: "bg-violet-500/10" },
              { icon: Phone,         label: "Phone",      desc: "+1 (800) 555-0200",      color: "text-emerald-500",bg: "bg-emerald-500/10" },
            ].map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cursor-pointer rounded-2xl border border-border/30 bg-card p-5 text-center shadow-sm hover:border-primary/30 transition-colors"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/30 bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Frequently Asked Questions</h3>
                <p className="text-sm text-muted-foreground">Common questions for doctors</p>
              </div>
            </div>
            {FAQ_ITEMS.map((item) => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
