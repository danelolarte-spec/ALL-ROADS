import { motion } from 'framer-motion'
import { galleryImages } from '../data/tours'

export default function Gallery() {
  return (
    <section id="galeria" className="relative bg-greenwhite py-24 md:py-32 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-forest text-white font-bold text-xs tracking-widest rounded-full">
              GALERÍA
            </span>
            <h2 className="mt-4 font-display text-5xl md:text-7xl text-neutral-900 leading-[0.95]">
              Momentos de{' '}
              <span className="text-pumpkin">buena vibra.</span>
            </h2>
          </div>
          <p className="text-neutral-700 md:max-w-sm">
            Cada recorrido deja huella. Así se ve Medallo con la energía de nuestros parceros.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[200px]">
          {galleryImages.map((img, i) => {
            const spans = [
              'col-span-2 row-span-2',
              'col-span-1 row-span-1',
              'col-span-1 row-span-2',
              'col-span-2 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
              'col-span-2 row-span-1',
              'col-span-1 row-span-2',
              'col-span-1 row-span-1',
              'col-span-2 row-span-1',
              'col-span-1 row-span-1',
              'col-span-1 row-span-1',
            ]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className={`group relative overflow-hidden rounded-2xl shadow-lg ${spans[i % spans.length]}`}
              >
                <img
                  src={img.src}
                  alt={img.caption || `Galería All Roads ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pumpkin/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="inline-block px-2.5 py-1 bg-white/95 text-pumpkin text-[11px] font-bold rounded-full shadow">
                    ☺ {img.caption || 'Medallo'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
