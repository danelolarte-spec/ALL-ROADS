import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown, Instagram, Phone } from 'lucide-react'
import { Flora, ElMono } from './Mascots'
import { BRAND, mantras } from '../data/tours'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-pumpkin grain"
    >
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ scale }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1598467367947-2bbbf39c9b34?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pumpkin/90 via-pumpkin/60 to-pumpkin" />
      </motion.div>

      {/* Floating blobs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-24 -left-16 w-80 h-80 bg-golden/70 rounded-full blur-3xl animate-blob"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-10 -right-10 w-96 h-96 bg-forest/40 rounded-full blur-3xl animate-blob"
      />

      {/* Floating mascots */}
      <motion.div
        style={{ y: y1 }}
        className="hidden md:block absolute right-[6%] top-[18%] z-10"
      >
        <Flora size={160} />
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        className="hidden md:block absolute left-[4%] bottom-[14%] z-10"
      >
        <ElMono size={140} />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 md:px-8 pt-32 md:pt-40 pb-24 min-h-[100svh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex self-start items-center gap-2 px-4 py-2 bg-golden text-neutral-900 rounded-full font-bold text-xs md:text-sm shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
          {BRAND.tagline}
        </motion.div>

        <h1 className="mt-6 font-display text-golden leading-[0.85] text-6xl sm:text-7xl md:text-[9rem] lg:text-[11rem] select-none">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="block"
          >
            ALL
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="block"
          >
            ROADS
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="inline-block ml-2 md:ml-6"
            >
              ☺
            </motion.span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 max-w-2xl text-white/95 text-lg md:text-2xl font-medium leading-snug"
        >
          Recorre Medellín con la{' '}
          <span className="text-golden font-extrabold">buena vibra</span> de siempre.
          Tours compartidos, experiencias auténticas y parches inolvidables en la capital
          paisa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href="#tours"
            className="group inline-flex items-center gap-3 px-7 py-4 bg-golden hover:bg-white text-neutral-900 font-bold rounded-full shadow-xl shadow-black/20 transition-all duration-300 hover:scale-[1.03]"
          >
            Ver tours
            <ArrowDown className="group-hover:translate-y-1 transition-transform" size={20} />
          </a>
          <a
            href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
              'Hola All Roads, quiero info de sus tours ☺'
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-7 py-4 border-2 border-white/80 text-white hover:bg-white hover:text-pumpkin font-bold rounded-full transition-all duration-300"
          >
            <Phone size={18} />
            Reservar por WhatsApp
          </a>
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-4 text-white/90 hover:text-golden transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={22} />
            <span className="font-semibold">{BRAND.instagram}</span>
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/70 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Marquee mantras */}
      <div className="absolute bottom-0 inset-x-0 bg-golden border-y-2 border-neutral-900 py-3 overflow-hidden">
        <div className="marquee-track font-display text-neutral-900 text-xl md:text-2xl">
          {[...mantras, ...mantras].map((m, i) => (
            <span key={i} className="flex items-center gap-6 pr-10 whitespace-nowrap">
              <span>{m}</span>
              <span className="text-pumpkin">☺</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
