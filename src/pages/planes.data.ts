export const plans = [
  {
    name: 'Gratis',
    price: 'B/.0',
    period: 'siempre',
    description: 'Empieza sin costo y prueba la plataforma.',
    features: [
      'Publicaciones de servicios sin costo (hasta 3)',
      'Perfil público',
      'Contacto con clientes',
      'Verificación UTP gratuita',
    ],
    featured: false,
  },
  {
    name: 'Estudiante',
    price: 'B/.1.99',
    period: 'por mes',
    description: 'Más espacio para ofrecer tus habilidades.',
    features: [
      'Hasta 6 servicios publicados',
      '1 destacada de 3 días al mes',
      'Perfil con mayor visibilidad',
      
    ],
    featured: true,
  },
  {
    name: 'Crecimiento',
    price: 'B/.3.99',
    period: 'por mes',
    description: 'Para quienes ya reciben solicitudes con frecuencia.',
    features: [
      'Hasta 12 servicios publicados',
      '2 destacadas de 7 días al mes',
      'Prioridad en resultados',
      
    ],
    featured: false,
  },
  {
    name: 'Profesional',
    price: 'B/.6.99',
    period: 'por mes',
    description: 'Más publicaciones y visibilidad para crecer.',
    features: [
      'Hasta 25 servicios publicados',
      '4 destacadas de 7 días al mes',
      'Perfil destacado en el catálogo',
      
    ],
    featured: false,
  },
] as const;

export const boosts = [
  {
    name: 'Impulso básico',
    duration: '3 días',
    price: 'B/.0.99',
    badge: undefined,
  },
  {
    name: 'Impulso estándar',
    duration: '7 días',
    price: 'B/.1.00',
    badge: 'Promoción de lanzamiento',
  },
  {
    name: 'Impulso mensual',
    duration: '30 días',
    price: 'B/.3.99',
    badge: undefined,
  },
] as const;
