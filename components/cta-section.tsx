"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CalendarDays, Loader2, X } from "lucide-react"
import { toast } from "sonner"

export function CTASection() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [showDemoForm, setShowDemoForm] = useState(false)
  const [demoEmail, setDemoEmail] = useState("")
  const [demoName, setDemoName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleStartTrial() {
    if (isSignedIn) {
      router.push("/dashboard")
    } else {
      router.push("/sign-up")
    }
  }

  async function handleDemoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!demoName.trim() || !demoEmail.trim()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    setShowDemoForm(false)
    setDemoName("")
    setDemoEmail("")
    toast.success("Demo request received! We'll reach out within 24 hours.")
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-transparent to-cyan-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-blue-500/20 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Ready to transform</span>
            <br />
            <span className="gradient-text">your healthcare experience?</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join over 500,000 patients who have already made the switch to smarter, more accessible healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleStartTrial}
              className="cursor-pointer bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 glow-blue text-lg px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowDemoForm(true)}
              className="cursor-pointer border-border bg-transparent hover:bg-secondary text-foreground text-lg px-8 py-6 gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarDays className="w-5 h-5" />
              Schedule a Demo
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-6">
            No credit card required · Cancel anytime · 24/7 support
          </p>
        </motion.div>
      </div>

      {/* Demo request modal */}
      <AnimatePresence>
        {showDemoForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={() => setShowDemoForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowDemoForm(false)}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Schedule a Demo</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We&apos;ll show you everything MediConnect can do for your practice.
                </p>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="demo-name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="demo-name"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    required
                    className="rounded-xl border-border/50 bg-secondary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="demo-email" className="text-sm font-medium">
                    Work Email
                  </label>
                  <Input
                    id="demo-email"
                    type="email"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="jane@clinic.com"
                    required
                    className="rounded-xl border-border/50 bg-secondary/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer w-full bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 py-5 rounded-xl transition-all duration-200"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Request Demo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
