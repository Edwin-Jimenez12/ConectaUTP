export const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para comenzar',
    description: 'Comparte tus habilidades sin pagar.',
    features: [
      'Hasta 3 servicios publicados',
      'Perfil público',
      'Contacto con clientes',
      'Verificación UTP gratuita',
    ],
    featured: false,
  },
  {
    name: 'Emprendedor',
    price: '$1.99',
    period: 'cada 30 días',
    description: 'Más espacio para hacer crecer tu oferta.',
    features: [
      'Hasta 6 servicios publicados',
      'Sin comisión por tus trabajos',
      'Más opciones para organizar tu perfil',
      'Acceso a promociones',
    ],
    featured: true,
  },
  {
    name: 'Portafolio',
    price: '$3.49',
    period: 'cada 30 días',
    description: 'Presenta una oferta más completa.',
    features: [
      'Hasta 10 servicios publicados',
      'Sin comisión por tus trabajos',
      'Prioridad para elegir promociones',
      'Ideal para varias habilidades',
    ],
    featured: false,
  },
] as const;

export const boosts = [
  {
    name: 'Impulso básico',
    duration: '3 días',
    price: '$0.99',
  },
  {
    name: 'Impulso estándar',
    duration: '7 días',
    price: '$1.49',
  },
  {
    name: 'Impulso mensual',
    duration: '30 días',
    price: '$3.99',
  },
] as const;
