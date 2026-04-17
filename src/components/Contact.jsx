import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone, Instagram, MapPin, Mail, Check } from 'lucide-react'
import { BRAND, tours } from '../data/tours'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', tour: '', message: '' })
  const [sent, setSent] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    const tourName = form.tour || 'cualquiera de sus tours'
    const text = encodeURIComponent(
      `Hola All Roads ☺\n\nSoy ${form.name || 'un(a) parcero(a)'}.\nQuiero info de: ${tourName}.\n\n${form.message || ''}\n\nCorreo: ${form.email || 'no indicado'}`
    )
    window.open(`https://wa.me/${BRAND.whatsapp}?text=${text}`, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contacto" className="relative bg-sky text-white py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-sky/80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-3 py-1 bg-golden text-neutral-900 font-bold text-xs tracking-widest rounded-full">
            CONTACTO
          </span>
          <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95]">
            Disfruta,
            <br />
            conecta,{' '}
            <span className="text-golden">sonríe.</span>
          </h2>
          <p className="mt-6 text-white/90 text-lg max-w-lg">
            Cuéntanos qué experiencia quieres vivir y te respondemos al instante por
            WhatsApp. <strong className="text-golden">En el camino nos encontramos.</strong>
          </p>

          <div className="mt-10 space-y-4">
            <ContactLink
              icon={<Phone size={20} />}
              label="WhatsApp"
              value={BRAND.phone}
              href={`https://wa.me/${BRAND.whatsapp}`}
            />
            <ContactLink
              icon={<Instagram size={20} />}
              label="Instagram"
              value={BRAND.instagram}
              href={BRAND.instagramUrl}
            />
            <ContactLink
              icon={<Mail size={20} />}
              label="Correo"
              value={BRAND.email}
              href={`mailto:${BRAND.email}`}
            />
            <ContactLink icon={<MapPin size={20} />} label="Ciudad" value={BRAND.city} />
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={onSubmit}
          className="relative bg-white text-neutral-900 rounded-[2rem] p-6 md:p-10 shadow-2xl border-4 border-golden/40"
        >
          <h3 className="font-display text-2xl md:text-3xl text-pumpkin">
            Pide tu cotización ☺
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Respondemos por WhatsApp con el plan a la medida.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="Nombre">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input"
                placeholder="Parcero(a) All Roads"
              />
            </Field>
            <Field label="Correo">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="tucorreo@email.com"
              />
            </Field>
            <Field label="Tour de interés">
              <select
                value={form.tour}
                onChange={(e) => setForm({ ...form, tour: e.target.value })}
                className="input"
              >
                <option value="">Seleccioná un tour</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} — {t.duration}
                  </option>
                ))}
                <option value="Experiencia adicional">Experiencia adicional</option>
              </select>
            </Field>
            <Field label="Mensaje">
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input resize-none"
                placeholder="Contanos fechas, cantidad de personas, dudas…"
              />
            </Field>

            <button
              type="submit"
              className="mt-2 inline-flex justify-center items-center gap-2 px-6 py-4 bg-pumpkin hover:bg-neutral-900 text-white font-bold rounded-full shadow-lg transition-all hover:scale-[1.02]"
            >
              {sent ? (
                <>
                  <Check size={18} />
                  ¡Enviado! Revisa tu WhatsApp
                </>
              ) : (
                <>
                  Enviar por WhatsApp
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
          <style>{`
            .input {
              width: 100%;
              padding: 0.9rem 1rem;
              border-radius: 1rem;
              background: #FCEBCD;
              border: 2px solid transparent;
              outline: none;
              font: inherit;
              color: #1a1a1a;
              transition: border-color .2s, background .2s;
            }
            .input:focus { border-color: #F56F00; background: #fff; }
            .input::placeholder { color: #9a8870; }
          `}</style>
        </motion.form>
      </div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-neutral-600">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function ContactLink({ icon, label, value, href }) {
  const Comp = href ? 'a' : 'div'
  return (
    <Comp
      href={href}
      target={href ? '_blank' : undefined}
      rel="noreferrer"
      className="group flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors backdrop-blur-sm"
    >
      <div className="w-11 h-11 rounded-xl bg-golden text-neutral-900 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-white/70">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </Comp>
  )
}
