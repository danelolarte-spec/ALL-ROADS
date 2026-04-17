import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Tours from './components/Tours'
import Extras from './components/Extras'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'

export default function App() {
  return (
    <div className="relative overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Tours />
        <Extras />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  )
}
