import { motion } from 'framer-motion'

export function Flora({ size = 120, className = '' }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Petals */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * 360
        return (
          <ellipse
            key={i}
            cx="100"
            cy="50"
            rx="18"
            ry="32"
            fill="#2FB6A8"
            transform={`rotate(${angle} 100 100)`}
          />
        )
      })}
      {/* Face circle */}
      <circle cx="100" cy="100" r="42" fill="#F3C700" />
      {/* Eyes */}
      <circle cx="85" cy="95" r="5" fill="#1a1a1a" />
      <circle cx="115" cy="95" r="5" fill="#1a1a1a" />
      <circle cx="87" cy="93" r="1.5" fill="#fff" />
      <circle cx="117" cy="93" r="1.5" fill="#fff" />
      {/* Smile */}
      <path
        d="M82 110 Q100 125 118 110"
        stroke="#1a1a1a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Cheeks */}
      <circle cx="78" cy="108" r="4" fill="#F56F00" opacity="0.5" />
      <circle cx="122" cy="108" r="4" fill="#F56F00" opacity="0.5" />
    </motion.svg>
  )
}

export function ElMono({ size = 120, className = '' }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      animate={{ y: [0, -12, 0], rotate: [3, -3, 3] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
    >
      {/* Sun rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360
        const rad = (angle * Math.PI) / 180
        const x1 = 100 + Math.cos(rad) * 50
        const y1 = 100 + Math.sin(rad) * 50
        const x2 = 100 + Math.cos(rad) * 80
        const y2 = 100 + Math.sin(rad) * 80
        return (
          <polygon
            key={i}
            points={`${x1},${y1} ${x2},${y2 - 2} ${x2 + 2},${y2 + 2}`}
            fill="#F3C700"
            transform={`rotate(${angle} 100 100)`}
          />
        )
      })}
      {/* Face circle */}
      <circle cx="100" cy="100" r="48" fill="#F56F00" />
      {/* Sunglasses */}
      <rect x="66" y="88" width="30" height="18" rx="9" fill="#1a1a1a" />
      <rect x="104" y="88" width="30" height="18" rx="9" fill="#1a1a1a" />
      <rect x="96" y="94" width="8" height="3" fill="#1a1a1a" />
      {/* Shine on glasses */}
      <ellipse cx="76" cy="93" rx="4" ry="2" fill="#fff" opacity="0.6" />
      <ellipse cx="114" cy="93" rx="4" ry="2" fill="#fff" opacity="0.6" />
      {/* Smile */}
      <path
        d="M78 118 Q100 138 122 118"
        stroke="#1a1a1a"
        strokeWidth="4"
        fill="#1a1a1a"
      />
      <path
        d="M82 120 Q100 134 118 120"
        fill="#fff"
      />
    </motion.svg>
  )
}
