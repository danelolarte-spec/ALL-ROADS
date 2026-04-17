/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    'bg-golden', 'bg-pumpkin', 'bg-forest', 'bg-greenwhite', 'bg-sky', 'bg-lightstep',
    'text-golden', 'text-pumpkin', 'text-forest', 'text-greenwhite', 'text-sky', 'text-lightstep',
    'border-golden', 'border-pumpkin', 'border-forest', 'border-sky',
    'from-golden', 'from-pumpkin', 'from-forest', 'from-sky', 'from-lightstep',
    'to-golden', 'to-pumpkin', 'to-forest', 'to-sky', 'to-greenwhite',
    'bg-pumpkin/10', 'bg-golden/10', 'bg-forest/10', 'bg-sky/10',
    'bg-pumpkin/15', 'bg-pumpkin/20', 'bg-pumpkin/30', 'bg-pumpkin/40',
    'bg-golden/20', 'bg-golden/30', 'bg-golden/40', 'bg-golden/70',
    'bg-forest/20', 'bg-forest/30', 'bg-forest/40',
    'bg-sky/20', 'bg-sky/30', 'bg-sky/40',
    'ring-golden', 'ring-pumpkin', 'ring-forest', 'ring-sky',
    'shadow-pumpkin/30', 'shadow-golden/30', 'shadow-forest/30', 'shadow-sky/30',
  ],
  theme: {
    extend: {
      colors: {
        golden: '#F3C700',
        pumpkin: '#F56F00',
        forest: '#009E53',
        greenwhite: '#DAEED4',
        sky: '#3569AF',
        lightstep: '#FCEBCD',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(3deg)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%,100%': { borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%' },
          '50%': { borderRadius: '70% 30% 45% 55% / 35% 60% 40% 65%' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        wiggle: 'wiggle 2.4s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        blob: 'blob 9s ease-in-out infinite',
        shine: 'shine 3s linear infinite',
        'pulse-ring': 'pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
