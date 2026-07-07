"use client"

import { motion } from "framer-motion"
import { Calendar, Video, Brain, Bell, Shield, Clock } from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI-powered appointment booking that finds the perfect time slot based on your preferences and doctor availability.",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: Video,
    title: "Virtual Consultations",
    description: "Connect with healthcare professionals from anywhere through secure, HD video calls.",
    gradient: "from-cyan-400 to-cyan-500"
  },
  {
    icon: Brain,
    title: "AI Health Assistant",
    description: "Get instant health insights and preliminary assessments powered by advanced AI technology.",
    gradient: "from-blue-400 to-cyan-400"
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss an appointment with intelligent notifications and follow-up reminders.",
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    icon: Shield,
    title: "Secure Records",
    description: "Your medical records are encrypted and stored securely, accessible only to you and your doctors.",
    gradient: "from-blue-600 to-cyan-400"
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access healthcare services anytime with our round-the-clock support and emergency care options.",
    gradient: "from-cyan-400 to-blue-500"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
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
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Everything you need for</span>
            <br />
            <span className="gradient-text">modern healthcare</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience healthcare that adapts to your lifestyle with cutting-edge technology and compassionate care.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/30">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:glow-blue transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className={`absolute inset-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
