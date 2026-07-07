"use client"

import { motion } from "framer-motion"

const stats = [
  {
    value: "500K+",
    label: "Active Patients",
    description: "Trust us with their healthcare"
  },
  {
    value: "2,500+",
    label: "Verified Doctors",
    description: "Across 50+ specialties"
  },
  {
    value: "99.9%",
    label: "Uptime",
    description: "Always available for you"
  },
  {
    value: "<5min",
    label: "Avg. Wait Time",
    description: "Quick access to care"
  }
]

export function StatsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
