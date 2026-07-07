"use client"

import { motion } from "framer-motion"
import { Search, CalendarCheck, Video, FileText } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Find Your Doctor",
    description: "Search through our network of verified healthcare professionals by specialty, location, or availability."
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Book Appointment",
    description: "Choose your preferred time slot and book instantly. Our AI suggests the best times based on your schedule."
  },
  {
    step: "03",
    icon: Video,
    title: "Consult",
    description: "Meet with your doctor in-person or through secure video call. Share medical history seamlessly."
  },
  {
    step: "04",
    icon: FileText,
    title: "Get Care",
    description: "Receive prescriptions, follow-up schedules, and track your health progress all in one place."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full glass text-sm text-cyan-400 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Healthcare made</span>
            <br />
            <span className="gradient-text">simple & accessible</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From finding the right doctor to receiving care, we have streamlined every step of your healthcare journey.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-20 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-30" />

          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                {/* Step Number & Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center relative z-10">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border z-20">
                    <span className="text-xs font-bold text-cyan-400">{item.step}</span>
                  </div>
                  <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 blur-xl opacity-50" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
