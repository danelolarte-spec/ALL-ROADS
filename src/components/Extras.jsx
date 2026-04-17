import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { experienciasAdicionales } from '../data/tours'

const colorMap = {
  sky: 'bg-sky',
  golden: 'bg-golden',
  forest: 'bg-forest',
  pumpkin: 'bg-pumpkin',
}
const textMap = {
  sky: 'text-white',
  golden: 'text-neutral-900',
  forest: 'text-white',
  pumpkin: 'text-white',
}

export default function Extras() {
  return (
    <section id="experiencias" className="relative bg-lightstep py-24 md:py-32 overflow-hidden">
      {/* Floating shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute top-10 right-10 w-48 h-48 border-[14px] border-pumpkin/20 rounded-full"
      />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 bg-pumpkin text-white font-bold text-xs tracking-widest rounded-full">
              TEMPORADAS ESPECIALES
            </span>
            <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95]">
              <span className="text-pumpkin">Experiencias</span>
              <br />
              adicionales.
            </h2>
            <p className="mt-6 text-neutral-700 text-base md:text-lg leading-relaxed max-w-xl">
              Creemos en la magia de viajar acompañados. Por eso desarrollamos paquetes
              turísticos que se adaptan a las diferentes épocas del año, permitiendo vivir
              la ciudad desde sus celebraciones más representativas.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {experienciasAdicionales.map((e, i) => (
              <motion.div
                key={e.name}
                initial={{ opacity: 0, y: 30, rotate: i % 2 ? 3 : -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 2 : -2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ rotate: 0, scale: 1.05, y: -6 }}
                className={`relative overflow-hidden ${colorMap[e.color]} ${textMap[e.color]} rounded-3xl shadow-xl`}
              >
                {e.image && (
                  <div className="relative h-28 md:h-32 overflow-hidden">
                    <img
                      src={e.image}
                      alt={e.name}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className={`absolute inset-0 ${colorMap[e.color]} mix-blend-multiply opacity-50`} />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-3xl md:text-4xl mb-2 animate-float">{e.emoji}</div>
                  <h3 className="font-display text-lg md:text-xl leading-tight">{e.name}</h3>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold opacity-90 bg-black/15 px-2 py-1 rounded-full">
                    <Calendar size={12} />
                    {e.season}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
