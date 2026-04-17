import { motion } from 'framer-motion'

export default function Logo({ color = '#F56F00', className = '', size = 'md' }) {
  const sizes = {
    sm: { text: 'text-xl', thumb: 28 },
    md: { text: 'text-3xl', thumb: 40 },
    lg: { text: 'text-5xl md:text-6xl', thumb: 64 },
    xl: { text: 'text-6xl md:text-8xl', thumb: 88 },
  }
  const s = sizes[size]
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} style={{ color }}>
      <span className={`font-display ${s.text} leading-none`}>ALL</span>
      <motion.span
        aria-hidden
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ThumbIcon size={s.thumb} color={color} />
      </motion.span>
      <span className={`font-display ${s.text} leading-none`}>ROADS</span>
    </div>
  )
}

export function ThumbIcon({ size = 40, color = '#F56F00' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <g stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Thumb up hand */}
        <path d="M24 34c0-6 2-11 6-14 2-1.5 3-3 3-5 0-2 2-3 3-2 2 1 2 4 1 7l-2 5h10c3 0 5 2 5 5 0 1-1 3-2 3 2 1 2 4 0 5 1 2 0 4-2 5 1 2-1 4-3 4H28c-2 0-4-1-4-3z" fill="#FFF" />
        <path d="M20 34h6v17h-6a2 2 0 01-2-2V36a2 2 0 012-2z" fill="#FFF" />
        {/* Smiley on thumb */}
        <circle cx="37.5" cy="22" r="0.9" fill={color} stroke="none" />
        <circle cx="41.5" cy="22" r="0.9" fill={color} stroke="none" />
        <path d="M36.8 24.5c.8 1 2.4 1 3.2 0" />
      </g>
    </svg>
  )
}

export function SmileyDot({ size = 20, color = '#F56F00' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="12" r="11" />
      <circle cx="9" cy="10" r="1.4" fill="#fff" />
      <circle cx="15" cy="10" r="1.4" fill="#fff" />
      <path d="M8 14c1.2 1.6 6.8 1.6 8 0" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}
