"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0"
      >
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details and security.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex min-h-0 flex-1 items-start justify-center overflow-hidden"
      >
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full h-full",
              cardBox: "w-full h-full shadow-none rounded-2xl border border-border/50 overflow-hidden",
              card: "bg-card/50 backdrop-blur-sm h-full",
              navbar: "border-r border-border/50 bg-card/30",
              navbarMobileMenuRow: "border-b border-border/50",
              pageScrollBox: "h-full overflow-y-auto",
              profilePage: "h-full",
            },
          }}
        />
      </motion.div>
    </div>
  );
}
