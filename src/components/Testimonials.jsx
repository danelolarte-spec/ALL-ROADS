import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { testimonials } from '../data/tours'

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const current = testimonials[index]

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative bg-pumpkin text-white py-24 md:py-32 overflow-hidden grain">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -left-40 w-[30rem] h-[30rem] border-[20px] border-golden/20 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-40 -right-40 w-[26rem] h-[26rem] border-[20px] border-white/10 rounded-full"
      />

      <div className="relative max-w-5xl mx-auto px-5 md:px-8 text-center">
        <span className="inline-block px-3 py-1 bg-golden text-neutral-900 font-bold text-xs tracking-widest rounded-full">
          TESTIMONIOS
        </span>
        <h2 className="mt-4 font-display text-5xl md:text-7xl text-golden leading-[0.95]">
          Lo que dicen{' '}
          <span className="text-white">nuestros parceros.</span>
        </h2>

        <div className="mt-14 relative">
          <Quote className="absolute -top-8 left-1/2 -translate-x-1/2 text-golden/40" size={64} />

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <p className="text-2xl md:text-3xl font-medium leading-snug italic max-w-3xl mx-auto">
                "{current.text}"
              </p>
              <div className="mt-8 flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} size={18} fill="#F3C700" stroke="#F3C700" />
                  ))}
                </div>
                <p className="mt-2 font-display text-xl">
                  {current.emoji} {current.name}
                </p>
                <p className="text-white/80 text-sm">{current.country}</p>
              </div>
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              aria-label="Anterior"
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white hover:text-pumpkin transition-colors flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Ver testimonio ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-8 bg-golden' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button
              aria-label="Siguiente"
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white hover:text-pumpkin transition-colors flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
