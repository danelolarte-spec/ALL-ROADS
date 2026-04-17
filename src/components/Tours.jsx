import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Clock, MapPin, Check, X, Sparkles } from 'lucide-react'
import { tours, BRAND } from '../data/tours'

const accentMap = {
  forest: { bg: 'bg-forest', text: 'text-forest', ring: 'ring-forest', soft: 'bg-forest/10' },
  pumpkin: { bg: 'bg-pumpkin', text: 'text-pumpkin', ring: 'ring-pumpkin', soft: 'bg-pumpkin/10' },
  sky: { bg: 'bg-sky', text: 'text-sky', ring: 'ring-sky', soft: 'bg-sky/10' },
  golden: { bg: 'bg-golden', text: 'text-golden', ring: 'ring-golden', soft: 'bg-golden/10' },
}

const bgMap = {
  golden: 'bg-golden',
  greenwhite: 'bg-greenwhite',
  lightstep: 'bg-lightstep',
  pumpkin: 'bg-pumpkin',
}

function formatCOP(n) {
  return '$' + n.toLocaleString('es-CO') + ' COP'
}

export default function Tours() {
  const [active, setActive] = useState(null)

  return (
    <section
      id="tours"
      className="relative bg-neutral-900 text-white py-24 md:py-32 overflow-hidden"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-golden rounded-full animate-blob" />
        <div className="absolute bottom-20 right-10 w-48 h-48 border-4 border-pumpkin rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-forest rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-pumpkin text-white font-bold text-xs tracking-widest rounded-full">
            NUESTROS TOURS · LO QUE TENEMOS PARA TI
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-5xl md:text-7xl text-golden leading-[0.95]"
          >
            Cada tour es un{' '}
            <span className="text-pumpkin">boleto a la felicidad.</span>
          </motion.h2>
          <p className="mt-4 text-white/80 text-lg">
            Tours compartidos diseñados para que sientas Medellín desde adentro.
            Elige tu camino y nosotros ponemos el plan.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((t, idx) => {
            const ac = accentMap[t.accent]
            return (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                whileHover={{ y: -10 }}
                className="group relative rounded-3xl overflow-hidden bg-white text-neutral-900 shadow-2xl tilt-card cursor-pointer"
                onClick={() => setActive(t)}
              >
                <div className="relative h-56 overflow-hidden">
                  <motion.img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                    onError={(e) => {
                      if (t.imageFallback && e.currentTarget.src !== t.imageFallback) {
                        e.currentTarget.src = t.imageFallback
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-bold ${ac.bg}`}>
                    <Clock size={12} className="inline mr-1 -mt-0.5" />
                    {t.duration}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-2xl md:text-3xl text-white leading-none">
                      {t.name}
                    </h3>
                    <p className="text-white/90 text-sm italic">{t.subtitle}</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-neutral-600 line-clamp-3">{t.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.places.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full ${ac.soft} ${ac.text}`}
                      >
                        {p}
                      </span>
                    ))}
                    {t.places.length > 3 && (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                        +{t.places.length - 3} más
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">
                        Por persona
                      </p>
                      <p className="font-display text-2xl text-neutral-900">
                        {formatCOP(t.price)}
                      </p>
                      <p className="text-[10px] text-neutral-500">+IVA cliente nacional</p>
                    </div>
                    <button
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-bold text-sm ${ac.bg} group-hover:scale-105 transition-transform`}
                    >
                      Ver más
                      <Sparkles size={14} />
                    </button>
                  </div>
                </div>

                {/* Accent border shine */}
                <div className={`absolute inset-0 ring-0 group-hover:ring-4 ${ac.ring} rounded-3xl transition-all pointer-events-none`} />
              </motion.article>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && <TourModal tour={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  )
}

function TourModal({ tour, onClose }) {
  const ac = accentMap[tour.accent]
  const whatsappMsg = encodeURIComponent(
    `Hola All Roads ☺, quiero reservar el tour "${tour.name}" (${tour.duration}, ${new Intl.NumberFormat('es-CO').format(tour.price)} COP). ¿Qué fechas tienen disponibles?`
  )
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white text-neutral-900 rounded-[2rem] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-pumpkin hover:text-white text-neutral-900 flex items-center justify-center shadow-lg transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        <div className="relative h-64 md:h-80">
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (tour.imageFallback && e.currentTarget.src !== tour.imageFallback) {
                e.currentTarget.src = tour.imageFallback
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-bold ${ac.bg}`}>
              <Clock size={12} />
              {tour.duration}
            </div>
            <h3 className="mt-2 font-display text-4xl md:text-5xl text-white">{tour.name}</h3>
            <p className="italic text-white/90">{tour.subtitle}</p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <p className="text-neutral-700 leading-relaxed">{tour.description}</p>

          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div>
              <h4 className={`font-display text-xl ${ac.text}`}>Conoce con nosotros</h4>
              <ul className="mt-3 space-y-2">
                {tour.places.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className={`${ac.text} mt-0.5 shrink-0`} />
                    <span className="text-neutral-700">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`font-display text-xl ${ac.text}`}>Nuestro tour incluye</h4>
              <ul className="mt-3 grid grid-cols-1 gap-2">
                {tour.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={`${ac.text} mt-0.5 shrink-0`} />
                    <span className="text-neutral-700">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-lightstep border-2 border-pumpkin/30">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Valor por persona</p>
              <p className={`font-display text-3xl ${ac.text}`}>
                {'$' + tour.price.toLocaleString('es-CO') + ' COP'}
              </p>
              <p className="text-[11px] text-neutral-500">+IVA si eres cliente nacional</p>
            </div>
            <a
              href={`https://wa.me/${BRAND.whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-bold ${ac.bg} shadow-lg hover:scale-105 transition-transform`}
            >
              Reservar por WhatsApp
              <Sparkles size={16} />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
