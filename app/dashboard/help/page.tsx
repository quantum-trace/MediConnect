"use client";

import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  Book,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How do I book an appointment?",
    a: "Go to 'Find Doctors' in the sidebar, select a doctor, pick a date and time slot, and confirm your booking. You'll receive a confirmation notification immediately.",
  },
  {
    q: "Can I reschedule or cancel an appointment?",
    a: "Yes. In 'My Appointments', click the three-dot menu on any upcoming appointment and choose 'Reschedule' or 'Cancel'. Cancellations must be made at least 2 hours before the scheduled time.",
  },
  {
    q: "How do I join a video consultation?",
    a: "When your appointment status is 'Confirmed', a 'Join Call' button will appear on your appointment card. Click it at the scheduled time to enter the video room.",
  },
  {
    q: "Where can I find my prescriptions?",
    a: "All prescriptions are available under 'Prescriptions' in the sidebar. You can view, download, or print each prescription as a PDF.",
  },
  {
    q: "How do I update my profile?",
    a: "Go to 'Settings' in the sidebar. Your profile is managed through Clerk's secure identity platform.",
  },
  {
    q: "Is my health data secure?",
    a: "Yes. MediConnect uses industry-standard encryption for all data at rest and in transit. Your health information is never sold or shared without your explicit consent.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers and get in touch with our team.</p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageSquare, label: "Live Chat",  desc: "Chat with support now",  color: "text-primary",    bg: "bg-primary/10" },
          { icon: Mail,          label: "Email",      desc: "support@mediconnect.io", color: "text-violet-500", bg: "bg-violet-500/10" },
          { icon: Phone,         label: "Phone",      desc: "+1 (800) 555-0100",      color: "text-emerald-500",bg: "bg-emerald-500/10" },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/50 p-5 text-center backdrop-blur-sm hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Frequently Asked Questions</h3>
            <p className="text-sm text-muted-foreground">Common questions and answers</p>
          </div>
        </div>
        {FAQ_ITEMS.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </motion.div>

      {/* Docs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Book className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="font-semibold">Documentation</p>
              <p className="text-sm text-muted-foreground">Full user guide and tutorials</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="cursor-pointer rounded-xl border-border/50">
            View Docs
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
