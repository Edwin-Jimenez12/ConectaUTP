export const plans = [
  {
    name: 'Gratis',
    price: 'B/.0',
    period: 'siempre',
    description: 'Empieza sin costo y prueba la plataforma.',
    features: [
      'Hasta 1 publicación',
      'Perfil público',
      'Contacto con clientes',
    ],
    featured: false,
  },
  {
    name: 'Estudiante',
    price: 'B/.1.99',
    period: 'por mes',
    description: 'Más espacio para ofrecer tus habilidades.',
    features: [
      'Hasta 6 publicaciones',
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
      'Hasta 12 publicaciones',
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
      'Hasta 25 publicaciones',
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
    benefit: '1 servicio destacado',
  },
  {
    name: 'Impulso estándar',
    duration: '7 días',
    price: 'B/.1.00',
    benefit: '1 servicio destacado',
  },
  {
    name: 'Impulso mensual',
    duration: '30 días',
    price: 'B/.3.99',
    benefit: '1 servicio destacado',
  },
] as const;
