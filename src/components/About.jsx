import { motion } from 'framer-motion'
import { Heart, Wallet, Sparkles, MapPin, Users, Compass } from 'lucide-react'
import { Flora, ElMono } from './Mascots'
import { values } from '../data/tours'

const iconMap = { Heart, Wallet, Sparkles, MapPin }

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
}

export default function About() {
  return (
    <section id="nosotros" className="relative bg-golden py-24 md:py-32 overflow-hidden grain">
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-96 h-96 border-[20px] border-pumpkin/20 rounded-full" />
      <div className="absolute -bottom-32 right-10 w-[30rem] h-[30rem] border-[16px] border-forest/20 rounded-full" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        {/* El destino */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="grid md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <span className="inline-block px-3 py-1 bg-pumpkin text-white font-bold text-xs tracking-widest rounded-full">
              CONOCÉ CON ALL ROADS
            </span>
            <h2 className="mt-4 font-display text-neutral-900 text-4xl md:text-6xl leading-[0.95]">
              El destino de la{' '}
              <span className="text-pumpkin">
                buena vibra
                <span className="inline-block w-3 h-3 bg-pumpkin rounded-full align-top ml-1" />
              </span>
            </h2>
            <p className="mt-6 text-neutral-800 text-base md:text-lg leading-relaxed max-w-xl">
              En <strong>All Roads</strong> creemos que Medellín es más que un destino: es un
              punto de encuentro donde todos los caminos se cruzan y cada visita se convierte
              en un recuerdo inolvidable. Aquí se siente el poder de la conexión genuina,
              donde lo sencillo se vuelve especial y esa energía te invita a vivir experiencias
              auténticas.
            </p>
          </div>
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]"
            >
              <img
                src="https://images.unsplash.com/photo-1598467367947-2bbbf39c9b34?q=80&w=1200&auto=format&fit=crop"
                alt="Medellín"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pumpkin/50 to-transparent" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-forest text-white flex items-center justify-center font-display text-sm uppercase tracking-widest shadow-xl"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <defs>
                  <path id="circle" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text fill="#fff" fontSize="9" fontWeight="800" letterSpacing="2">
                  <textPath xlinkHref="#circle">
                    · Buena vibra · Buen parche · Buena vibra · Buen parche
                  </textPath>
                </text>
              </svg>
              <span className="text-3xl">☺</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Lo que nos hace diferentes */}
        <div className="mt-24 md:mt-32 grid md:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-neutral-900 text-4xl md:text-6xl leading-[0.95]">
              Lo que nos hace{' '}
              <span className="text-pumpkin">diferentes.</span>
            </h2>
            <p className="mt-6 text-neutral-800 text-base md:text-lg leading-relaxed">
              Conectamos viajeros con la esencia vibrante y auténtica de Medellín.
              Creemos en la buena vibra, los buenos parches y la conexión genuina con la
              cultura local. Somos el puente hacia una ciudad accesible, llena de color,
              energía y calidez.
            </p>
            <div className="mt-8 p-5 bg-neutral-900 text-golden rounded-2xl inline-block">
              <p className="font-display text-xl md:text-2xl">
                Nosotros ponemos el plan
                <br />y tú la buena vibra.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {values.map((v, i) => {
              const Icon = iconMap[v.icon]
              return (
                <motion.div
                  key={v.title}
                  whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
                  className="p-6 bg-white rounded-2xl shadow-lg border-2 border-neutral-900/5 hover:border-pumpkin/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-pumpkin/15 text-pumpkin flex items-center justify-center mb-3">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display text-lg text-neutral-900">{v.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 leading-snug">{v.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Lo que tenemos para ti */}
        <div className="mt-24 md:mt-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-center text-neutral-900 text-4xl md:text-6xl leading-[0.95]"
          >
            Lo que All Roads{' '}
            <span className="text-pumpkin">tiene para ti.</span>
          </motion.h2>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Feature
              icon={<Users size={28} />}
              title="Tours compartidos, parches inolvidables"
              desc="Conéctate con otros viajeros, haz amigos y vive la ciudad en buena compañía. Así es el estilo All Roads."
              color="pumpkin"
              mascot={<ElMono size={120} className="absolute -top-8 -right-4" />}
            />
            <Feature
              icon={<Compass size={28} />}
              title="Experiencias locales y auténticas"
              desc="Nada de turismo superficial: aquí vas a sentir Medallo desde su arte, su historia y su gente."
              color="forest"
              mascot={<Flora size={120} className="absolute -top-8 -right-4" />}
            />
          </div>
        </div>

        {/* Mascots section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 md:mt-32 bg-lightstep rounded-[2.5rem] p-8 md:p-14 shadow-xl border-4 border-pumpkin/20"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-golden text-neutral-900 font-bold text-xs tracking-widest rounded-full">
                LOS PARCEROS
              </span>
              <h3 className="mt-3 font-display text-4xl md:text-5xl text-pumpkin">
                Los parceros que{' '}
                <br />
                <span className="text-neutral-900">nos representan.</span>
              </h3>
            </div>
            <div className="flex justify-center gap-6">
              <div className="flex flex-col items-center">
                <Flora size={140} />
                <span className="mt-2 font-display text-pumpkin">FLORA</span>
              </div>
              <div className="flex flex-col items-center">
                <ElMono size={140} />
                <span className="mt-2 font-display text-pumpkin">EL MONO</span>
              </div>
            </div>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h4 className="font-display text-xl text-pumpkin">FLORA 🌻</h4>
              <p className="mt-2 text-neutral-700 text-sm leading-relaxed">
                La flor que llena cada experiencia de color y significado. Representa la
                conexión con lo local, las historias auténticas y los detalles que hacen
                única a la ciudad.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h4 className="font-display text-xl text-pumpkin">EL MONO 😎</h4>
              <p className="mt-2 text-neutral-700 text-sm leading-relaxed">
                El parcero que nunca falla en un buen plan. Representa la calidez, el humor
                y esa energía cercana que se siente en cada rincón de Medallo.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Feature({ icon, title, desc, color, mascot }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="relative overflow-hidden p-8 md:p-10 bg-white rounded-3xl shadow-xl border-2 border-neutral-900/5"
    >
      <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full bg-${color}/10`} />
      {mascot}
      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-${color}`}>
        {icon}
      </div>
      <h3 className="relative mt-4 font-display text-2xl text-neutral-900">{title}</h3>
      <p className="relative mt-2 text-neutral-700 leading-relaxed max-w-md">{desc}</p>
    </motion.div>
  )
}
