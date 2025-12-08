// Vitrinnea Customer Service Bot - Message Handler
// This code runs in n8n Code node to process Chatwoot messages

// Extract webhook data (Vitrinnea's structure is double-nested)
const raw = $input.item.json;
const body = raw.body?.body || raw.body || {};

// Check if this is an outgoing message (from bot) - skip those to prevent infinite loop
const messageType = body.message_type;
const senderType = body.sender?.type;

if (messageType === 'outgoing' || (senderType && senderType !== 'contact')) {
  return [];
}

// Extract IDs from body
const conversationId = body.conversation?.id;
const accountId = body.account?.id;

if (!conversationId || !accountId) {
  return [];
}

const message = (body.content || '').toLowerCase();
const senderName = body.sender?.name || 'cliente';

// Business hours (Costa Rica time - assuming UTC-6)
const now = new Date();
const hour = now.getHours();
const day = now.getDay();
const isBusinessHours = (day >= 1 && day <= 5) && (hour >= 9 && hour < 18);

// Extract order number if present
const orderMatch = message.match(/#?(\d{4,8})/);
const orderNumber = orderMatch ? orderMatch[1] : null;

// Sentiment detection
const urgentWords = ['urgente', 'asap', 'rápido', 'ya', 'ahora', 'emergencia'];
const negativeWords = ['enojado', 'molesto', 'terrible', 'malo', 'pésimo', 'horrible'];
const isUrgent = urgentWords.some(word => message.includes(word));
const isNegative = negativeWords.some(word => message.includes(word));

let intent = 'general';
let response = '';

// Intent classification with Spanish responses
if (message.includes('hola') || message.includes('buenos') || message.includes('buenas') || message.includes('hello') || message.includes('hi')) {
  intent = 'greeting';
  response = isBusinessHours 
    ? `¡Hola ${senderName}! 👋 Bienvenido a Vitrinnea. ¿En qué puedo ayudarte hoy?`
    : `¡Hola ${senderName}! 👋 Estamos fuera de horario (Lun-Vie 9am-6pm), pero igual puedo ayudarte. ¿Qué necesitas?`;
} else if (message.includes('precio') || message.includes('cost') || message.includes('cuánto') || message.includes('cuanto')) {
  intent = 'pricing';
  response = '💰 Con gusto te ayudo con información de precios. ¿Qué producto te interesa? Puedes enviarme el nombre o enlace del artículo.';
} else if (message.includes('devol') || message.includes('reembolso') || message.includes('cancelar')) {
  intent = 'returns';
  response = orderNumber
    ? `📦 Entendido, revisaré tu pedido #${orderNumber} para procesar la devolución. Nuestras políticas permiten devoluciones dentro de 30 días. ¿Cuál es el motivo?`
    : '📦 Puedo ayudarte con devoluciones. Por favor proporcioname tu número de orden para revisar tu caso.';
} else if (message.includes('envio') || message.includes('envío') || message.includes('entrega') || message.includes('delivery') || message.includes('shipping')) {
  intent = 'shipping';
  response = '🚚 Nuestros tiempos de envío son:\n\n• Envío Estándar: 5-7 días hábiles\n• Envío Express: 2-3 días hábiles\n\n¿Necesitas rastrear un pedido o tienes alguna pregunta específica?';
} else if (message.includes('pedido') || message.includes('orden') || message.includes('order') || message.includes('rastreo') || message.includes('track')) {
  intent = 'order_status';
  response = orderNumber
    ? `🔍 Perfecto, déjame verificar el estado de tu orden #${orderNumber}. Un momento por favor...`
    : '🔍 Para revisar tu pedido necesito el número de orden. Lo encuentras en tu correo de confirmación (ejemplo: #12345).';
} else if (message.includes('pago') || message.includes('cobro') || message.includes('tarjeta') || message.includes('factura')) {
  intent = 'billing';
  response = '💳 Te ayudo con temas de facturación. ¿Cuál es tu consulta específica? (problemas de cobro, solicitud de factura, métodos de pago, etc.)';
} else if (message.includes('cuenta') || message.includes('perfil') || message.includes('contraseña') || message.includes('login')) {
  intent = 'account';
  response = '👤 Para asistencia con tu cuenta, puedo ayudarte con:\n\n• Recuperar contraseña\n• Actualizar información\n• Problemas de acceso\n\n¿Qué necesitas?';
} else if (message.includes('disponib') || message.includes('stock') || message.includes('hay')) {
  intent = 'availability';
  response = '📊 Para verificar disponibilidad, necesito saber qué producto te interesa. ¿Me puedes compartir el nombre o enlace?';
} else if (message.includes('queja') || message.includes('reclam') || message.includes('problema') || isNegative) {
  intent = 'complaint';
  response = `😔 Lamento mucho que hayas tenido una mala experiencia, ${senderName}. Tu satisfacción es muy importante. Por favor cuéntame qué sucedió para resolverlo cuanto antes. ${isBusinessHours ? 'También puedo transferirte con un supervisor.' : 'Puedes solicitar hablar con un supervisor mañana en horario laboral.'}`;
} else if (message.includes('horario') || message.includes('schedule') || message.includes('abierto')) {
  intent = 'hours';
  response = '🕐 Nuestro horario de atención es:\n\nLunes a Viernes: 9:00 AM - 6:00 PM (Hora Costa Rica)\nSábados y Domingos: Cerrado\n\n¿En qué más puedo ayudarte?';
} else if (message.includes('contacto') || message.includes('teléfono') || message.includes('email') || message.includes('whatsapp')) {
  intent = 'contact';
  response = '📞 Puedes contactarnos por:\n\n• Chat (aquí mismo)\n• Email: soporte@vitrinnea.com\n• WhatsApp: [número]\n• Teléfono: [número]\n\n¿Prefieres algún canal en particular?';
} else if (message.includes('ayuda') || message.includes('help') || message.includes('soporte') || message.includes('support')) {
  intent = 'support';
  response = '🆘 Estoy aquí para ayudarte. Puedo asistirte con:\n\n• Estado de pedidos 📦\n• Envíos y entregas 🚚\n• Devoluciones y cambios 🔄\n• Información de productos 🛍️\n• Facturación 💳\n\n¿Qué necesitas?';
} else if (message.includes('gracias') || message.includes('thank')) {
  intent = 'thanks';
  response = '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?';
} else if (message.includes('adios') || message.includes('adiós') || message.includes('bye') || message.includes('chao')) {
  intent = 'goodbye';
  response = '¡Hasta pronto! 👋 Que tengas un excelente día. Estamos aquí cuando nos necesites.';
} else {
  intent = 'general';
  response = `Hola ${senderName}, gracias por escribirnos. ¿En qué puedo ayudarte hoy? Puedo asistirte con pedidos, envíos, productos, devoluciones y más. 😊`;
}

// Add urgency flag if detected
if (isUrgent && isBusinessHours) {
  response += '\n\n⚡ Veo que es urgente. Si necesitas atención inmediata, puedo transferirte con un agente humano.';
}

return {
  conversation_id: conversationId,
  account_id: accountId,
  sender_name: senderName,
  original_message: body.content,
  intent: intent,
  response_text: response,
  is_urgent: isUrgent,
  is_negative: isNegative,
  order_number: orderNumber
};
