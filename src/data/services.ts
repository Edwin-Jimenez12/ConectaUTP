export interface Service {
  id: number;
  title: string;
  provider: string;
  price: string;
  rating: string;
  category: string;
  locked?: boolean;
}

export const categories = [
  'Todos',
  'Diseño',
  'Desarrollo web',
  'Tutorías',
  'Fotografía',
];

export const services: Service[] = [
  {
    id: 1,
    title: 'Mantenimiento de PC',
    provider: 'Edwin Jiménez',
    price: 'Desde $40',
    rating: '5.0',
    category: 'Desarrollo web',
  },
  {
    id: 2,
    title: 'Diseños gráficos',
    provider: 'Juan Pérez',
    price: 'Desde $15',
    rating: '4.8',
    category: 'Diseño',
  },
  {
    id: 3,
    title: 'Sesiones de fotografía',
    provider: 'Lucía Gonzales',
    price: 'Desde $45',
    rating: '4.9',
    category: 'Fotografía',
  },
  {
    id: 4,
    title: 'Tutorías personalizadas',
    provider: 'María Torres',
    price: 'Desde $20',
    rating: '5.0',
    category: 'Tutorías',
    locked: true,
  },
  {
    id: 5,
    title: 'Edición de video',
    provider: 'Carlos Ruiz',
    price: 'Desde $30',
    rating: '4.9',
    category: 'Diseño',
    locked: true,
  },
  {
    id: 6,
    title: 'Asesoría de proyectos',
    provider: 'Ana Flores',
    price: 'Desde $25',
    rating: '5.0',
    category: 'Tutorías',
    locked: true,
  },
];
