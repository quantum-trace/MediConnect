"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs"
import { Menu, X, Activity, ChevronRight, Sparkles, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
]

export function Navbar() {
  const { isSignedIn } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled ? "py-3" : "py-5"
        }`}
      >
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isScrolled
              ? "bg-background/60 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
              : "bg-transparent"
          }`}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(34,211,238,0.5), transparent)",
          }}
        />

        <div className="container relative mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-70 blur-lg transition-all duration-500" />

                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 p-[1px] overflow-hidden">
                  <div className="w-full h-full rounded-[11px] bg-background/90 flex items-center justify-center backdrop-blur-sm">
                    <Activity className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>

                <div className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-pulse" />
              </motion.div>

              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight text-foreground leading-none">
                  Medi
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Connect
                  </span>
                </span>

                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium mt-0.5">
                  Healthcare
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setActiveLink(link.href)}
                    onMouseLeave={() => setActiveLink("")}
                    className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {activeLink === link.href && (
                      <motion.span
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-full bg-white/[0.06]"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="relative z-10">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <Link href="/auth/redirect">
                    <Button
                      variant="ghost"
                      className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Button>
                  </Link>
                  <UserButton />
                </>
              ) : (
                <>
                  <SignInButton fallbackRedirectUrl="/auth/redirect">
                    <Button
                      variant="ghost"
                      className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                    >
                      Sign In
                    </Button>
                  </SignInButton>

                  <SignUpButton fallbackRedirectUrl="/auth/redirect">
                    <Button className="cursor-pointer relative group bg-linear-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-400 hover:via-blue-500 hover:to-cyan-400 text-white border-0 px-5 py-2.5 text-sm font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300">
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Get Started
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <div className="absolute inset-0 rounded-md bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-foreground hover:bg-white/[0.1] transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm lg:hidden"
            >
              <div className="h-full bg-background/95 backdrop-blur-2xl border-l border-white/[0.05] shadow-2xl p-6 pt-24">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all duration-200 group"
                    >
                      {link.label}

                      <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ))}
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

                {/* Mobile CTA */}
                <div className="flex flex-col gap-3">
                  {isSignedIn ? (
                    <>
                      <Link href="/auth/redirect" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="cursor-pointer w-full justify-center py-6 text-base font-medium border-white/10 hover:bg-white/5 gap-2"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          My Dashboard
                        </Button>
                      </Link>
                      <div className="flex justify-center pt-2">
                        <UserButton />
                      </div>
                    </>
                  ) : (
                    <>
                      <SignInButton fallbackRedirectUrl="/auth/redirect">
                        <Button
                          variant="outline"
                          className="cursor-pointer w-full justify-center py-6 text-base font-medium border-white/10 hover:bg-white/5"
                        >
                          Sign In
                        </Button>
                      </SignInButton>

                      <SignUpButton fallbackRedirectUrl="/auth/redirect">
                        <Button className="cursor-pointer w-full justify-center py-6 text-base font-medium bg-linear-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-400 hover:via-blue-500 hover:to-cyan-400 text-white border-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Get Started Free
                        </Button>
                      </SignUpButton>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}