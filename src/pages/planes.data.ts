export const plans = [
  {
    name: 'Gratis',
    price: 'B/.0',
    period: 'siempre',
    description: 'Publica tus servicios y conecta con estudiantes sin pagar suscripciones.',
    features: [
      'Publicaciones de servicios sin costo',
      'Perfil público',
      'Contacto con clientes',
      'Verificación UTP gratuita',
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
