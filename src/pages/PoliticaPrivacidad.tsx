import { LegalDocument, LegalSection, LegalList } from '../components/LegalDocument';
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from '../lib/legal';

export function PoliticaPrivacidad() {
  return (
    <LegalDocument
      eyebrow="Documento legal"
      title="Política de privacidad"
      description={`Última actualización: ${LEGAL_EFFECTIVE_DATE}. Explica qué información tratamos, para qué la usamos y qué opciones tienes sobre tus datos en ConectaUTP.`}
    >
      <p>Esta política aplica a ConectaUTP, plataforma operada por Nex Digital, y se interpreta de acuerdo con la normativa aplicable en la República de Panamá, incluyendo el marco general de protección de datos personales.</p>

      <LegalSection number="1" title="Responsable y contacto">
        <p>El responsable de la operación de ConectaUTP es Nex Digital. Para consultas, solicitudes o reclamos relacionados con tus datos personales, puedes escribir a <a className="font-semibold text-[#7b32ca] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
      </LegalSection>

      <LegalSection number="2" title="Información que recopilamos">
        <LegalList>
          <li><strong>Cuenta:</strong> correo electrónico, contraseña gestionada por el proveedor de autenticación, nombre, apellido y username.</li>
          <li><strong>Perfil:</strong> biografía, foto, carrera, facultad, sede, ubicación y preferencias de visibilidad que decidas completar.</li>
          <li><strong>Publicaciones:</strong> títulos, descripciones, categorías, modalidad, precios e imágenes de los servicios.</li>
          <li><strong>Interacciones:</strong> mensajes, solicitudes de servicio y publicaciones guardadas como favoritos.</li>
          <li><strong>Soporte:</strong> información que envíes mediante formularios de opinión o contacto.</li>
          <li><strong>Preferencias técnicas:</strong> configuración de tema, vista y otros datos mínimos guardados en el navegador para recordar tus preferencias.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number="3" title="Para qué usamos la información">
        <LegalList>
          <li>Crear y proteger tu cuenta, autenticarte y permitirte recuperar el acceso.</li>
          <li>Mostrar publicaciones y perfiles según las opciones de visibilidad que configures.</li>
          <li>Facilitar mensajes, solicitudes de servicio, favoritos y herramientas de gestión.</li>
          <li>Administrar planes, promociones, actualizaciones y funciones de la plataforma.</li>
          <li>Prevenir fraude, abuso, accesos no autorizados y actividades que infrinjan los términos.</li>
          <li>Responder consultas, mejorar el producto y cumplir obligaciones legales.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number="4" title="Bases y límites del tratamiento">
        <p>Tratamos los datos cuando son necesarios para prestar el servicio solicitado, cuando otorgas consentimiento, cuando existe un interés legítimo de seguridad y funcionamiento, o cuando debemos cumplir una obligación legal. No solicitamos datos sensibles para utilizar las funciones principales de ConectaUTP.</p>
        <p>No vendemos tus datos personales. Tampoco mostramos públicamente tu correo electrónico. La información que incluyas en una publicación o perfil configurado como visible puede ser consultada por otros usuarios o visitantes según la función correspondiente.</p>
      </LegalSection>

      <LegalSection number="5" title="Con quién compartimos datos">
        <p>Podemos compartir información únicamente cuando sea necesario para operar el servicio: proveedores tecnológicos de autenticación, base de datos, almacenamiento y envío de comunicaciones; autoridades cuando exista una obligación legal; o usuarios con quienes decidas interactuar.</p>
        <p>Estos proveedores actúan bajo instrucciones relacionadas con la prestación técnica y deben aplicar medidas de seguridad apropiadas. No autorizamos el uso de tus datos para fines propios ajenos al servicio contratado.</p>
      </LegalSection>

      <LegalSection number="6" title="Visibilidad y control del perfil">
        <p>Puedes modificar la visibilidad del perfil, ubicación, identidad mostrada y otros datos desde Configuración. El correo electrónico permanece oculto para otros usuarios. Las publicaciones activas pueden ser visibles mientras estén publicadas y cumplan las reglas del catálogo.</p>
      </LegalSection>

      <LegalSection number="7" title="Conservación y seguridad">
        <p>Conservamos la información durante el tiempo necesario para prestar el servicio, resolver disputas, mantener registros técnicos y cumplir obligaciones legales. Aplicamos controles de acceso, políticas de seguridad y medidas razonables para proteger la información, aunque ningún sistema conectado a internet puede garantizar riesgo cero.</p>
      </LegalSection>

      <LegalSection number="8" title="Tus derechos">
        <p>Puedes solicitar acceso, actualización, rectificación, cancelación o eliminación de tus datos, así como oponerte a determinados tratamientos cuando corresponda. Para hacerlo, escribe a {SUPPORT_EMAIL} desde el correo asociado a tu cuenta e indica claramente tu solicitud.</p>
        <p>Podemos pedir información adicional para verificar tu identidad y responderemos dentro de los plazos exigidos por la normativa aplicable. Algunas solicitudes pueden limitarse cuando exista una obligación legal de conservación o una razón legítima documentada.</p>
      </LegalSection>

      <LegalSection number="9" title="Cookies y almacenamiento local">
        <p>ConectaUTP utiliza almacenamiento local del navegador para recordar preferencias como el tema visual y la forma de ver el catálogo. También puede utilizar tecnologías estrictamente necesarias para mantener la sesión y proteger el acceso. Puedes borrar estos datos desde la configuración del navegador, aunque algunas funciones podrían dejar de recordar tus preferencias.</p>
      </LegalSection>

      <LegalSection number="10" title="Cambios a esta política">
        <p>Podemos actualizar esta política cuando cambien la plataforma, los proveedores tecnológicos o la normativa. La fecha y versión vigente aparecerán en esta página. Si el cambio requiere consentimiento, te lo solicitaremos antes de aplicar el nuevo tratamiento.</p>
      </LegalSection>

      <p className="border-t border-slate-200 pt-5 text-xs text-[#676878]">Versión vigente desde {LEGAL_EFFECTIVE_DATE}. Para cualquier consulta: {SUPPORT_EMAIL}.</p>
    </LegalDocument>
  );
}
