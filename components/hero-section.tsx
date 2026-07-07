"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Shield, Clock, Users, X } from "lucide-react"

export function HeroSection() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [showDemo, setShowDemo] = useState(false)

  function handleBookAppointment() {
    if (isSignedIn) {
      router.push("/booking")
    } else {
      router.push("/sign-up")
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-600/10 rounded-full blur-[150px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-muted-foreground">Now available in 50+ cities</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">Healthcare</span>
              <br />
              <span className="gradient-text">Reimagined</span>
              <br />
              <span className="text-foreground">For You</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Book appointments with top doctors in seconds. Experience healthcare that puts you first with AI-powered scheduling and personalized care.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Button
                size="lg"
                onClick={handleBookAppointment}
                className="cursor-pointer bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 glow-blue text-lg px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="cursor-pointer border-border bg-transparent hover:bg-secondary text-foreground text-lg px-8 py-6 group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="mr-2 w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">500K+ Patients</span>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Doctor Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 relative"
          >
            <div className="relative max-w-md mx-auto">
              {/* Main Card */}
              <div className="glass-card rounded-3xl p-6 relative z-10">
                {/* Doctor Profile */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white">
                      DR
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">Dr. Sarah Chen</h3>
                    <p className="text-cyan-400 text-sm">Cardiologist</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                      <span className="text-muted-foreground text-sm ml-1">4.9 (2.4k reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Next Available</p>
                      <p className="text-foreground font-semibold">Today, 2:30 PM</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  </div>

                  <Button
                    onClick={handleBookAppointment}
                    className="cursor-pointer w-full bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 py-6 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Book Now - Free Consultation
                  </Button>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="hidden sm:block absolute -top-8 -right-8 md:-top-10 md:-right-16 lg:-right-20 glass-card rounded-2xl p-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Wait Time</p>
                    <p className="text-foreground font-bold">5 minutes</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="hidden sm:block absolute -bottom-8 -left-8 md:-bottom-10 md:-left-16 lg:-left-20 glass-card rounded-2xl p-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Insurance</p>
                    <p className="text-foreground font-bold">Accepted</p>
                  </div>
                </div>
              </motion.div>

              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-8 max-w-lg w-full text-center relative"
            >
              <button
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
                <Play className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Platform Demo</h3>
              <p className="text-muted-foreground mb-6">
                See how MediConnect makes booking healthcare appointments effortless — from finding a specialist to your first consultation.
              </p>
              <div className="space-y-3 text-left text-sm">
                {[
                  "Search and filter verified doctors by specialty",
                  "Pick a date and time slot that suits you",
                  "Join a secure video consultation from anywhere",
                  "Access prescriptions and health records anytime",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => { setShowDemo(false); handleBookAppointment() }}
                className="cursor-pointer mt-6 w-full bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 py-5 transition-all duration-200 hover:scale-[1.01]"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
