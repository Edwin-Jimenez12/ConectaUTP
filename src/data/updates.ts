export interface PlatformUpdate {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  status: 'Publicado' | 'Borrador' | 'Programado';
}

export const platformUpdates: PlatformUpdate[] = [
  {
    id: 'chat-unificado',
    title: 'Chats más organizados',
    summary: 'Ahora las solicitudes de servicio y las conversaciones directas permanecen en un solo chat por persona.',
    date: '20 sep 2026',
    category: 'Comunidad',
    status: 'Publicado',
  },
  {
    id: 'editor-imagenes',
    title: 'Nuevo editor de imágenes',
    summary: 'Ajusta el encuadre, zoom y posición de las imágenes antes de publicar un servicio.',
    date: '18 sep 2026',
    category: 'Producto',
    status: 'Publicado',
  },
  {
    id: 'pagos-yappy',
    title: 'Pagos para planes y promociones',
    summary: 'Estamos preparando una forma sencilla de pagar planes y publicaciones destacadas desde ConectaUTP.',
    date: 'Próximamente',
    category: 'Anuncios',
    status: 'Programado',
  },
];
