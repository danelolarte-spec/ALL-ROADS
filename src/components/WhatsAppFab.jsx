import { motion } from 'framer-motion'
import { BRAND } from '../data/tours'

export default function WhatsAppFab() {
  const href = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    'Hola All Roads ☺, quiero info de sus tours'
  )}`
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 group"
      aria-label="Escribir por WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" />
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-pulse-ring" style={{ animationDelay: '0.6s' }} />
      <span className="relative flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-2xl p-4 md:pr-5 md:pl-4">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39-.103 0-.215-.072-.48-.255-.76-.526-2.102-1.67-2.932-2.857-.285-.406-.32-.67-.32-.716 0-.142.142-.214.142-.499 0-.285.214-.427.285-.641.071-.215.214-.427.142-.642-.072-.214-.928-2.31-1.07-2.738-.143-.428-.286-.571-.5-.571-.215 0-.5-.072-.785-.072-.285 0-.856.143-1.285.642-.428.5-1.642 1.712-1.642 4.198 0 2.486 1.714 4.9 1.928 5.2.214.214 3.286 5.486 8.2 7.67 4.914 2.186 4.914 1.43 5.814 1.358.9-.071 2.843-1.143 3.256-2.286.414-1.143.414-2.114.286-2.286-.136-.17-.5-.214-1.071-.428-.571-.214-3.257-1.6-3.757-1.786-.5-.187-.857-.287-1.257.285zM16 3.2c7.062 0 12.8 5.738 12.8 12.8 0 2.347-.622 4.56-1.772 6.463l1.915 7.008-7.18-1.885C20.099 28.4 18.08 28.8 16 28.8 8.938 28.8 3.2 23.062 3.2 16 3.2 8.938 8.938 3.2 16 3.2z" />
        </svg>
        <span className="hidden md:inline font-bold pr-1">¡Hola!</span>
      </span>
    </motion.a>
  )
}
