import { LegalDocument, LegalSection, LegalList } from '../components/LegalDocument';
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from '../lib/legal';

export function Terminos() {
  return (
    <LegalDocument
      eyebrow="Documento legal"
      title="Términos y condiciones"
      description={`Última actualización: ${LEGAL_EFFECTIVE_DATE}. Estos términos establecen las reglas para utilizar ConectaUTP, una plataforma operada por Nex Digital.`}
    >
      <p>Al crear una cuenta, navegar con una cuenta registrada o utilizar las funciones de ConectaUTP, aceptas estos Términos y Condiciones. Si no estás de acuerdo, no debes crear una cuenta ni utilizar las funciones que requieren registro.</p>

      <LegalSection number="1" title="Qué es ConectaUTP">
        <p>ConectaUTP es una plataforma digital que permite a miembros de la comunidad UTP publicar servicios, descubrir publicaciones, comunicarse y organizar oportunidades de colaboración. ConectaUTP no es parte de los acuerdos que los usuarios celebren entre sí y no actúa como empleador, representante, intermediario laboral ni garante de los servicios publicados.</p>
      </LegalSection>

      <LegalSection number="2" title="Registro y cuenta">
        <p>Para utilizar funciones como publicar servicios, enviar mensajes, guardar favoritos o contratar planes, debes proporcionar información veraz y mantenerla actualizada. Eres responsable de proteger tus credenciales y de toda actividad realizada desde tu cuenta.</p>
        <LegalList>
          <li>Debes tener capacidad legal para aceptar estos términos.</li>
          <li>No debes crear cuentas falsas, suplantar a otra persona ni compartir tu contraseña.</li>
          <li>Debes notificarnos si sospechas que tu cuenta fue comprometida.</li>
          <li>La aceptación de estos términos y de la Política de Privacidad se registra con la versión y fecha correspondientes.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number="3" title="Publicaciones y conducta">
        <p>Quien publica un servicio es responsable de su descripción, precio, disponibilidad, imágenes, permisos y cumplimiento de las leyes aplicables. Las publicaciones deben ser claras, legítimas y relacionadas con una oferta real.</p>
        <p>Está prohibido publicar contenido fraudulento, ilegal, discriminatorio, amenazante, sexualmente explícito, que infrinja derechos de terceros, que contenga malware o que intente manipular la plataforma.</p>
      </LegalSection>

      <LegalSection number="4" title="Mensajes y acuerdos entre usuarios">
        <p>Las conversaciones de ConectaUTP son una herramienta de contacto. Antes de contratar, verifica la identidad, condiciones, precio, alcance y forma de entrega con la otra persona. Cada usuario decide si acepta o no un trabajo y asume las obligaciones del acuerdo que celebre.</p>
        <p>ConectaUTP no garantiza la calidad, disponibilidad, resultados, seguridad, identidad o cumplimiento de ningún servicio publicado por terceros.</p>
      </LegalSection>

      <LegalSection number="5" title="Planes, promociones y pagos de ConectaUTP">
        <p>ConectaUTP puede ofrecer planes y promociones para proveedores, con precios, beneficios, límites y fechas visibles antes de adquirirlos. Los beneficios funcionales se aplican según la configuración vigente del plan o promoción.</p>
        <p>La plataforma no cobra comisión por los trabajos que los proveedores acuerden con sus clientes. Cuando se habilite un canal de pago para planes o promociones, se informarán el precio final, la periodicidad, las condiciones de renovación y el canal utilizado antes de confirmar la compra.</p>
      </LegalSection>

      <LegalSection number="6" title="Contenido y propiedad intelectual">
        <p>Conservas tus derechos sobre el contenido que publiques. Al publicarlo, otorgas a ConectaUTP una licencia no exclusiva, mundial y limitada para alojarlo, reproducirlo, adaptarlo al formato de la plataforma y mostrarlo mientras mantengas la publicación activa.</p>
        <p>El nombre, logotipo, diseño, software y demás elementos de ConectaUTP pertenecen a Nex Digital o a sus licenciantes y no pueden copiarse, modificarse o explotarse sin autorización.</p>
      </LegalSection>

      <LegalSection number="7" title="Moderación y suspensión">
        <p>Podemos ocultar o retirar publicaciones, limitar funciones o suspender cuentas cuando exista incumplimiento de estos términos, riesgo para la comunidad, fraude, requerimiento legal o uso abusivo. Cuando sea razonable, informaremos el motivo y el canal disponible para solicitar una revisión.</p>
      </LegalSection>

      <LegalSection number="8" title="Disponibilidad y responsabilidad">
        <p>La plataforma se ofrece según disponibilidad. Podemos realizar mantenimiento, cambios o interrupciones temporales. En la medida permitida por la ley, Nex Digital no será responsable por pérdidas indirectas, acuerdos entre usuarios, información incorrecta de terceros o resultados de servicios contratados fuera de la plataforma.</p>
      </LegalSection>

      <LegalSection number="9" title="Cambios y terminación">
        <p>Podemos actualizar estos términos para reflejar cambios legales, operativos o funcionales. Publicaremos la nueva versión en esta página. Si el cambio requiere una nueva aceptación, te la solicitaremos antes de continuar utilizando la función correspondiente.</p>
        <p>Puedes dejar de usar ConectaUTP y solicitar la eliminación de tu cuenta desde la configuración o mediante {SUPPORT_EMAIL}, sujeto a obligaciones legales y necesidades legítimas de conservación.</p>
      </LegalSection>

      <LegalSection number="10" title="Ley aplicable y contacto">
        <p>Estos términos se interpretan conforme a las leyes de la República de Panamá, sin perjuicio de los derechos irrenunciables que correspondan al usuario. Para consultas sobre estos términos, escribe a <a className="font-semibold text-[#7b32ca] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
      </LegalSection>

      <p className="border-t border-slate-200 pt-5 text-xs text-[#676878]">Versión vigente desde {LEGAL_EFFECTIVE_DATE}.</p>
    </LegalDocument>
  );
}
