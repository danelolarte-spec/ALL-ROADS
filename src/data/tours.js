export const BRAND = {
  name: 'All Roads',
  tagline: '¡En la ciudad de la buena vibra!',
  claim: 'Recorre la ciudad de la buena vibra',
  instagram: '@allroads.medellin',
  instagramUrl: 'https://instagram.com/allroads.medellin',
  phone: '+57 302 1012821',
  whatsapp: '573021012821',
  email: 'hola@allroads.co',
  city: 'Medellín, Colombia',
}

export const tours = [
  {
    id: 'city-comuna',
    name: 'City + Comuna',
    subtitle: 'Camino de la ciudad al barrio',
    duration: '8 horas',
    price: 220000,
    accent: 'forest',
    bg: 'golden',
    image:
      'https://images.unsplash.com/photo-1598467367947-2bbbf39c9b34?q=80&w=1600&auto=format&fit=crop',
    description:
      'Un recorrido cultural que contextualiza la historia reciente de Medellín a través de espacios de memoria. Contrastamos identidad antioqueña con vistas panorámicas de la Medellín actual, conociendo símbolos de transformación urbana, arte y resiliencia comunitaria, como solo All Roads sabe hacerlo.',
    places: [
      'Parque de la Inflexión',
      'Pueblito Paisa',
      'Graffitour',
      'Barrio Los Olivos',
      'Metrocable',
      'Museo del Café',
    ],
    includes: [
      'Transporte ida y vuelta',
      'Guía certificado',
      'Almuerzo típico en mirador',
      'Snack',
      'Souvenir',
      'Hidratación',
      'Asistencia médica',
    ],
  },
  {
    id: 'guatape',
    name: 'Guatapé',
    subtitle: 'Camino a un pueblo con encanto',
    duration: '8 horas',
    price: 230000,
    accent: 'pumpkin',
    bg: 'greenwhite',
    image:
      'https://images.unsplash.com/photo-1599992181788-d56dfe0f8087?q=80&w=1600&auto=format&fit=crop',
    description:
      'Vive Guatapé a través de sus paisajes, cultura e identidad única. Déjate sorprender por la Piedra del Peñol, las vistas del embalse y la armonía entre naturaleza y agua. Una experiencia auténtica, con calma y el estilo All Roads.',
    places: [
      'Piedra del Peñol (no incluye entrada)',
      'Calle de los Zócalos',
      'Alto del Chocho (panorámico)',
    ],
    includes: [
      'Transporte ida y vuelta',
      'Guía certificado',
      'Recorrido en planchón',
      'Degustación de frutas típicas',
      'Almuerzo en restaurante flotante',
      'Museo Anticuario',
      'Snack',
      'Souvenir',
      'Hidratación',
      'Asistencia médica',
    ],
  },
  {
    id: 'tour-cafetero',
    name: 'Tour Cafetero',
    subtitle: 'Camino a la tierra del café',
    duration: '5 horas',
    price: 245000,
    accent: 'sky',
    bg: 'lightstep',
    image:
      'https://images.unsplash.com/photo-1559525839-d9acfd5ed2d1?q=80&w=1600&auto=format&fit=crop',
    description:
      'Conecta con la esencia del café colombiano en una experiencia rural a pocos minutos de Medellín. Recorre paisajes de montaña en San Sebastián de Palmitas, descubre el origen del café especial y vive una experiencia auténtica cercana al estilo All Roads.',
    places: ['Finca del café en San Sebastián de Palmitas'],
    includes: [
      'Transporte ida y vuelta',
      'Guía local',
      'Recorrido interactivo por la finca',
      'Experiencia de elaboración de café',
      'Traje típico durante la experiencia',
      'Cata de cafés',
      'Almuerzo típico',
      'Snack',
      'Souvenir',
      'Hidratación',
      'Asistencia médica',
    ],
  },
  {
    id: 'medellin-transforma',
    name: 'Medellín se Transforma',
    subtitle: 'Camino a un barrio de transformación',
    duration: '5 horas',
    price: 155000,
    accent: 'pumpkin',
    bg: 'greenwhite',
    image:
      'https://images.unsplash.com/photo-1592836724492-0fcfb68f2b9d?q=80&w=1600&auto=format&fit=crop',
    description:
      'Conoce la transformación y evolución de Medellín a través de un recorrido que conecta su historia, memoria y espíritu resiliente. Descubre espacios urbanos que reflejan el cambio social, el arte y la innovación que hoy definen a la ciudad.',
    places: [
      'Cementerio Montesacro',
      'Parque de la Inflexión',
      'Alpujarra',
      'Parque de los Pies Descalzos',
      'Parques del Río',
      'Pueblito Paisa',
    ],
    includes: [
      'Transporte ida y vuelta',
      'Guía certificado',
      'Snack',
      'Souvenir',
      'Hidratación',
      'Asistencia médica',
    ],
  },
  {
    id: 'comuna-13',
    name: 'Comuna 13',
    subtitle: 'Camino a un barrio de transformación',
    duration: '5 horas',
    price: 150000,
    accent: 'forest',
    bg: 'lightstep',
    image:
      'https://images.unsplash.com/photo-1580130601339-b86dff5abcd1?q=80&w=1600&auto=format&fit=crop',
    description:
      'Sumérgete en la historia y la transformación de la Comuna 13. Recorre un territorio donde el arte urbano, los grafitis, las escaleras eléctricas y los miradores reflejan identidad, resiliencia y expresión cultural, al estilo All Roads.',
    places: ['Graffitour (Comuna 13)', 'Show de baile', 'Museo del Café'],
    includes: [
      'Transporte ida y vuelta',
      'Guía local',
      'Snack',
      'Souvenir',
      'Hidratación',
      'Asistencia médica',
    ],
  },
]

export const experienciasAdicionales = [
  {
    name: 'Tour Religioso',
    season: 'Semana Santa',
    emoji: '⛪',
    color: 'sky',
  },
  {
    name: 'Tour Feria de Flores',
    season: 'Feria de Flores',
    emoji: '🌻',
    color: 'golden',
  },
  {
    name: 'Tour Finca Silletera',
    season: 'Feria de Flores',
    emoji: '💐',
    color: 'forest',
  },
  {
    name: 'Tour Tradición Navideña',
    season: 'Época decembrina',
    emoji: '🎄',
    color: 'pumpkin',
  },
]

export const testimonials = [
  {
    name: 'Camila R.',
    country: 'Bogotá, Colombia',
    text: '¡Qué buena vibra! El tour de la Comuna 13 me voló la cabeza, el guía conocía cada rincón y cada grafiti tiene su historia. 100% recomendado.',
    emoji: '🇨🇴',
    rating: 5,
  },
  {
    name: 'Diego M.',
    country: 'Ciudad de México',
    text: 'Guatapé con All Roads fue una experiencia parchada. El recorrido en planchón y el almuerzo flotante, espectaculares. Repetiría sin pensarlo.',
    emoji: '🇲🇽',
    rating: 5,
  },
  {
    name: 'Sophie L.',
    country: 'París, Francia',
    text: 'Le Tour Cafetero était magnifique. Aprendí a preparar café y me llevé un traje típico. ¡Muy auténtico y cercano!',
    emoji: '🇫🇷',
    rating: 5,
  },
  {
    name: 'Andrés P.',
    country: 'Buenos Aires',
    text: 'Pedí el City + Comuna y me llevé Medallo en el corazón. Nosotros pusimos las ganas, ellos pusieron el mejor plan.',
    emoji: '🇦🇷',
    rating: 5,
  },
  {
    name: 'Laura T.',
    country: 'Madrid, España',
    text: 'La atención desde el WhatsApp hasta el último minuto del tour fue increíble. Flora y El Mono deberían ser embajadores de Colombia.',
    emoji: '🇪🇸',
    rating: 5,
  },
]

export const galleryImages = [
  'https://images.unsplash.com/photo-1580130601339-b86dff5abcd1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599992181788-d56dfe0f8087?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1559525839-d9acfd5ed2d1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598467367947-2bbbf39c9b34?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592836724492-0fcfb68f2b9d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518638150340-f706e86654de?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1200&auto=format&fit=crop',
]

export const mantras = [
  '¡En la ciudad de la buena vibra!',
  'En el camino nos encontramos',
  'Buen clima y buen parche en Medallo',
  'Recorre la ciudad de la buena vibra',
  'Disfruta, conecta, sonríe',
  'Conoce la esencia de Medallo',
  'Nosotros ponemos el plan y tú la buena vibra',
  'Cada tour es un boleto a la felicidad',
]

export const values = [
  { title: 'Cercanía', icon: 'Heart', desc: 'Trato humano y acompañamiento en cada paso del camino.' },
  { title: 'Accesibilidad', icon: 'Wallet', desc: 'Tours compartidos a precios pensados para todos.' },
  { title: 'Calidad', icon: 'Sparkles', desc: 'Guías certificados, transporte seguro y detalles que importan.' },
  { title: 'Autenticidad', icon: 'MapPin', desc: 'Experiencias locales reales, sin turismo superficial.' },
]
