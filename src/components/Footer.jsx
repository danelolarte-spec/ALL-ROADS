import { motion } from 'framer-motion'
import { Instagram, Phone, Mail, MapPin, ArrowUp } from 'lucide-react'
import Logo from './Logo'
import { BRAND, tours } from '../data/tours'

export default function Footer() {
  return (
    <footer className="relative bg-neutral-900 text-white pt-20 pb-8 overflow-hidden">
      <div className="absolute -top-px inset-x-0 h-24 bg-sky curve-top" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo size="md" color="#F3C700" />
            <p className="mt-4 text-white/70 max-w-sm">
              Agencia de turismo compartido en Medellín. Nosotros ponemos el plan, tú la
              buena vibra.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialButton href={BRAND.instagramUrl} icon={<Instagram size={18} />} />
              <SocialButton
                href={`https://wa.me/${BRAND.whatsapp}`}
                icon={<Phone size={18} />}
              />
              <SocialButton href={`mailto:${BRAND.email}`} icon={<Mail size={18} />} />
            </div>
          </div>

          <div>
            <h4 className="font-display text-golden text-lg">Tours</h4>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              {tours.map((t) => (
                <li key={t.id}>
                  <a href="#tours" className="hover:text-pumpkin transition-colors">
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-golden text-lg">Contacto</h4>
            <ul className="mt-4 space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 text-pumpkin" />
                {BRAND.phone}
              </li>
              <li className="flex items-start gap-2">
                <Instagram size={14} className="mt-0.5 text-pumpkin" />
                {BRAND.instagram}
              </li>
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 text-pumpkin" />
                {BRAND.email}
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-pumpkin" />
                {BRAND.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} All Roads · Todos los derechos reservados.</p>
          <p>
            Hecho con <span className="text-pumpkin">♥</span> en la{' '}
            <span className="text-golden font-semibold">ciudad de la buena vibra</span>.
          </p>
          <a
            href="#inicio"
            className="inline-flex items-center gap-1 hover:text-pumpkin transition-colors"
          >
            Volver arriba <ArrowUp size={14} />
          </a>
        </div>
      </div>

      {/* Giant watermark */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.06 }}
        viewport={{ once: true }}
        className="pointer-events-none absolute -bottom-10 inset-x-0 text-center font-display text-white text-[20vw] leading-none"
      >
        ALL ROADS
      </motion.div>
    </footer>
  )
}

function SocialButton({ href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-pumpkin hover:text-white text-white/80 flex items-center justify-center transition-all hover:scale-110"
    >
      {icon}
    </a>
  )
}
