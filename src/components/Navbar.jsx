import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

const links = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#tours', label: 'Tours' },
  { href: '#experiencias', label: 'Experiencias' },
  { href: '#galeria', label: 'Galería' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-lightstep/95 backdrop-blur-md shadow-lg border-b border-pumpkin/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-8 py-3 md:py-4 flex items-center justify-between">
        <a href="#inicio" className="flex items-center">
          <Logo size="sm" color="#F56F00" />
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l, i) => (
            <motion.li
              key={l.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <a
                href={l.href}
                className="relative px-4 py-2 text-sm font-semibold text-neutral-800 hover:text-pumpkin transition-colors group"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-pumpkin scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </motion.li>
          ))}
          <li className="ml-2">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pumpkin hover:bg-golden hover:text-neutral-900 text-white font-bold rounded-full shadow-lg shadow-pumpkin/30 transition-all duration-300 hover:scale-105"
            >
              Reservar
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </a>
          </li>
        </ul>

        <button
          aria-label="Menú"
          className="lg:hidden p-2 text-pumpkin"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-lightstep border-t border-pumpkin/10 overflow-hidden"
          >
            <ul className="px-5 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    onClick={() => setOpen(false)}
                    href={l.href}
                    className="block px-4 py-3 text-base font-semibold text-neutral-800 hover:bg-golden/30 rounded-xl"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  onClick={() => setOpen(false)}
                  href="#contacto"
                  className="mt-2 block px-4 py-3 text-center bg-pumpkin text-white font-bold rounded-full"
                >
                  Reservar ahora
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
