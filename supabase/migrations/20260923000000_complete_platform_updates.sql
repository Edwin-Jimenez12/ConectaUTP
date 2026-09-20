-- Las actualizaciones muestran su descripción completa y no requieren tiempo de lectura.

update public.platform_updates
set content = case slug
  when 'chat-unificado' then 'Las solicitudes de servicio y las conversaciones directas ahora comparten una sola conversación por persona. Esto evita chats duplicados cuando un proveedor recibe varias solicitudes y mantiene todo el historial organizado en un mismo lugar.'
  when 'editor-imagenes' then 'El nuevo editor permite recortar manualmente, alejar o acercar la imagen, moverla dentro del marco y revisar una vista previa antes de guardar. El ajuste se conserva para que la publicación se vea correctamente en escritorio y dispositivos móviles.'
  when 'pagos-planes-promociones' then 'Estamos preparando una forma sencilla de pagar planes y promociones desde ConectaUTP. La integración se habilitará cuando terminemos la conexión con el proveedor de pagos.'
  else content
end
where slug in ('chat-unificado', 'editor-imagenes', 'pagos-planes-promociones');

alter table public.platform_updates
drop column if exists read_time_minutes;
