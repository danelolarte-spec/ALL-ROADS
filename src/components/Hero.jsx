import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { ArrowDown, Instagram, Phone, Clock } from 'lucide-react'
import { Flora, ElMono } from './Mascots'
import { BRAND, mantras, tours, HERO_IMAGE, HERO_FALLBACK } from '../data/tours'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const [bg, setBg] = useState(HERO_IMAGE)

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-neutral-900 grain"
    >
      {/* Hidden image to detect 404 and swap to fallback */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="hidden"
        onError={() => setBg(HERO_FALLBACK)}
      />

      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ scale }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pumpkin/70 via-pumpkin/40 to-neutral-900/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/60 via-transparent to-transparent" />
      </motion.div>

      {/* Floating blobs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-24 -left-16 w-80 h-80 bg-golden/30 rounded-full blur-3xl animate-blob"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-10 -right-10 w-96 h-96 bg-forest/30 rounded-full blur-3xl animate-blob"
      />

      {/* Floating mascots */}
      <motion.div
        style={{ y: y1 }}
        className="hidden lg:block absolute right-[6%] top-[14%] z-10"
      >
        <Flora size={140} />
      </motion.div>
      <motion.div
        style={{ y: y2 }}
        className="hidden lg:block absolute left-[3%] bottom-[28%] z-10"
      >
        <ElMono size={120} />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 md:px-8 pt-28 md:pt-32 pb-32 min-h-[100svh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex self-start items-center gap-2 px-4 py-2 bg-golden text-neutral-900 rounded-full font-bold text-xs md:text-sm shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
          {BRAND.tagline}
        </motion.div>

        <h1 className="mt-5 font-display text-golden leading-[0.85] text-6xl sm:text-7xl md:text-[8rem] lg:text-[10rem] select-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
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
          className="mt-5 max-w-2xl text-white/95 text-lg md:text-2xl font-medium leading-snug drop-shadow"
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
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <a
            href="#tours"
            className="group inline-flex items-center gap-3 px-7 py-4 bg-golden hover:bg-white text-neutral-900 font-bold rounded-full shadow-xl shadow-black/30 transition-all duration-300 hover:scale-[1.03]"
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
            Reservar WhatsApp
          </a>
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-3 text-white/90 hover:text-golden transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={22} />
            <span className="font-semibold hidden sm:inline">{BRAND.instagram}</span>
          </a>
        </motion.div>

        {/* Tour quick-pick (TOURS PROTAGONISTAS desde el hero) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-10"
        >
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-widest font-bold mb-3">
            ☺ Elige tu camino
          </p>
          <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-1 px-1">
            {tours.map((t, i) => (
              <motion.a
                key={t.id}
                href="#tours"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group shrink-0 w-44 md:w-52 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 hover:border-golden transition-all"
              >
                <div className="relative h-24 md:h-28 overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-golden text-neutral-900 text-[10px] font-bold rounded-full">
                    <Clock size={10} />
                    {t.duration}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-display text-white text-sm md:text-base leading-tight">
                    {t.name}
                  </p>
                  <p className="text-golden text-xs font-bold mt-1">
                    Desde ${(t.price / 1000).toFixed(0)}k COP
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
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
      <div className="absolute bottom-0 inset-x-0 bg-golden border-y-2 border-neutral-900 py-3 overflow-hidden z-30">
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
