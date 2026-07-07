"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Emily Rodriguez",
    role: "Patient",
    avatar: "ER",
    rating: 5,
    content: "MediConnect has transformed how I manage my family&apos;s healthcare. Booking appointments used to be such a hassle, but now it&apos;s just a few taps away. The virtual consultation feature saved us multiple trips to the clinic.",
    highlight: "Transformed my healthcare experience"
  },
  {
    name: "Dr. James Morrison",
    role: "Cardiologist",
    avatar: "JM",
    rating: 5,
    content: "As a physician, I&apos;ve seen many healthcare platforms, but MediConnect stands out. The AI scheduling reduces no-shows by 60%, and the secure video consultations have helped me reach patients who couldn&apos;t visit in person.",
    highlight: "Reduced no-shows by 60%"
  },
  {
    name: "Sarah Kim",
    role: "Patient",
    avatar: "SK",
    rating: 5,
    content: "The 24/7 availability is a game-changer. When my son had a fever at 2 AM, I was able to consult with a pediatrician immediately. The peace of mind this platform provides is invaluable to our family.",
    highlight: "24/7 care when I needed it most"
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
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
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Loved by patients</span>
            <br />
            <span className="gradient-text">and doctors alike</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {"Don't just take our word for it. Here's what our community has to say about their MediConnect experience."}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/30">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-10 h-10 text-blue-500/30" />
                </div>

                {/* Highlight */}
                <div className="text-cyan-400 font-semibold mb-4">
                  {`"${testimonial.highlight}"`}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed flex-1 mb-6">
                  {testimonial.content}
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground mb-8">Trusted by leading healthcare organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["Mayo Clinic", "Cleveland Clinic", "Johns Hopkins", "Stanford Health", "Kaiser Permanente"].map((name, index) => (
              <div 
                key={index}
                className="text-xl md:text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors cursor-default"
              >
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
