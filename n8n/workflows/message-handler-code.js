// Vitrinnea Customer Service Bot - Message Handler with Menu & Multi-Inbox Support
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
const inboxId = body.inbox?.id || body.conversation?.inbox_id;

if (!conversationId || !accountId) {
  return [];
}

// INBOX-SPECIFIC CONFIGURATIONS
const inboxConfig = {
  17: { // WhatsApp El Salvador
    name: 'WhatsApp SV',
    greeting: 'WhatsApp',
    supportEmail: 'soporte-sv@vitrinnea.com',
    phone: '+503 XXXX-XXXX'
  },
  23: { // WhatsApp (default)
    name: 'WhatsApp',
    greeting: 'WhatsApp',
    supportEmail: 'soporte@vitrinnea.com',
    phone: '+506 XXXX-XXXX'
  },
  default: {
    name: 'Chat',
    greeting: 'Vitrinnea',
    supportEmail: 'soporte@vitrinnea.com',
    phone: '+506 XXXX-XXXX'
  }
};

const inbox = inboxConfig[inboxId] || inboxConfig.default;

const message = (body.content || '').toLowerCase().trim();
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
let needsHuman = false;

// MENU OPTIONS (detect numbers 1-9 or "menu")
if (message === '1' || message.includes('menu') || message.includes('menú') || message.includes('opciones')) {
  intent = 'menu';
  response = `📋 *Menú de Opciones - ${inbox.name}*\n\nEscribe el número de tu consulta:\n\n1️⃣ Estado de mi pedido\n2️⃣ Información de envío\n3️⃣ Devoluciones y cambios\n4️⃣ Precios y productos\n5️⃣ Problemas con mi cuenta\n6️⃣ Facturación y pagos\n7️⃣ Disponibilidad de productos\n8️⃣ Horarios y contacto\n9️⃣ 🙋 Hablar con un agente humano\n\n💬 O simplemente escribe tu pregunta y te ayudaré.`;
  
} else if (message === '2') {
  intent = 'shipping';
  response = '🚚 *Información de Envío*\n\n• Envío Estándar: 5-7 días hábiles\n• Envío Express: 2-3 días hábiles\n• Envío Internacional: 10-15 días hábiles\n\n¿Tienes un número de rastreo o necesitas rastrear tu pedido? Envíame el número de orden.';
  
} else if (message === '3') {
  intent = 'returns';
  response = orderNumber
    ? `📦 Perfecto, revisaré tu pedido #${orderNumber} para procesar la devolución.\n\n*Política de Devoluciones:*\n• 30 días desde la compra\n• Producto sin usar y en empaque original\n• Reembolso completo o cambio\n\n¿Cuál es el motivo de la devolución?`
    : '📦 *Devoluciones y Cambios*\n\nPara ayudarte necesito:\n• Número de orden (ej: #12345)\n• Motivo de la devolución\n\nPor favor proporcióname tu número de orden.';
  
} else if (message === '4') {
  intent = 'pricing';
  response = '💰 *Información de Precios y Productos*\n\nCon gusto te ayudo. Por favor:\n• Envíame el nombre del producto\n• O comparte el enlace del artículo\n\n¿Qué producto te interesa?';
  
} else if (message === '5') {
  intent = 'account';
  response = '👤 *Asistencia con tu Cuenta*\n\nPuedo ayudarte con:\n• 🔑 Recuperar contraseña\n• ✏️ Actualizar información personal\n• 🚪 Problemas de acceso/login\n• 📧 Cambiar email registrado\n\n¿Qué necesitas hacer?';
  
} else if (message === '6') {
  intent = 'billing';
  response = '💳 *Facturación y Pagos*\n\n¿En qué puedo ayudarte?\n• 🧾 Solicitar factura\n• ❌ Problema con un cobro\n• 💰 Consultar métodos de pago\n• 🔄 Cambiar información de pago\n\nCuéntame tu situación.';
  
} else if (message === '7') {
  intent = 'availability';
  response = '📊 *Consulta de Disponibilidad*\n\nPara verificar stock:\n• Envíame el nombre del producto\n• O comparte el enlace\n\n¿Qué producto buscas?';
  
} else if (message === '8') {
  intent = 'contact';
  response = `📞 *Información de Contacto*\n\n*Horario:*\n🕐 Lun-Vie: 9:00 AM - 6:00 PM\n🕐 Sáb-Dom: Cerrado\n\n*Canales:*\n💬 Chat: Aquí mismo\n📧 Email: ${inbox.supportEmail}\n📱 Teléfono: ${inbox.phone}\n\n¿En qué más puedo ayudarte?`;
  
} else if (message === '9' || message.includes('agente') || message.includes('humano') || message.includes('persona') || message.includes('asesor')) {
  intent = 'request_agent';
  needsHuman = true;
  response = isBusinessHours
    ? `🙋 Perfecto ${senderName}, te estoy conectando con un agente humano.\n\nUn miembro de nuestro equipo estará contigo en breve. Por favor describe tu consulta mientras tanto.`
    : `🙋 Entiendo que prefieres hablar con un agente, ${senderName}.\n\n⏰ Actualmente estamos fuera de horario (Lun-Vie 9am-6pm). Un agente te contactará mañana en cuanto abramos.\n\nMientras tanto, ¿puedo ayudarte con algo?`;
    
} else if (message.includes('hola') || message.includes('buenos') || message.includes('buenas') || message.includes('hello') || message.includes('hi')) {
  intent = 'greeting';
  response = `¡Hola ${senderName}! 👋 Bienvenido a Vitrinnea ${inbox.greeting}.\n\n📋 *¿Cómo puedo ayudarte hoy?*\n\nEscribe *MENU* para ver todas las opciones, o directamente:\n\n1️⃣ Estado de pedido\n2️⃣ Envíos\n3️⃣ Devoluciones\n4️⃣ Precios\n5️⃣ Mi cuenta\n6️⃣ Facturación\n7️⃣ Disponibilidad\n8️⃣ Contacto\n9️⃣ Hablar con agente\n\n💬 O escribe tu pregunta libremente.`;
} else if (message.includes('precio') || message.includes('cost') || message.includes('cuánto') || message.includes('cuanto')) {
  intent = 'pricing';
  response = '💰 Con gusto te ayudo con información de precios. ¿Qué producto te interesa? Puedes enviarme el nombre o enlace del artículo.\n\n_Escribe MENU para ver todas las opciones._';
} else if (message.includes('devol') || message.includes('reembolso') || message.includes('cancelar')) {
  intent = 'returns';
  response = orderNumber
    ? `📦 Entendido, revisaré tu pedido #${orderNumber} para procesar la devolución. Nuestras políticas permiten devoluciones dentro de 30 días. ¿Cuál es el motivo?\n\n_Escribe 9 o "agente" si prefieres hablar con un humano._`
    : '📦 Puedo ayudarte con devoluciones. Por favor proporcioname tu número de orden para revisar tu caso.\n\n_Escribe MENU para más opciones._';
} else if (message.includes('envio') || message.includes('envío') || message.includes('entrega') || message.includes('delivery') || message.includes('shipping')) {
  intent = 'shipping';
  response = '🚚 *Tiempos de Envío:*\n\n• Estándar: 5-7 días\n• Express: 2-3 días\n• Internacional: 10-15 días\n\n¿Necesitas rastrear un pedido?\n\n_Escribe MENU para más opciones._';
} else if (message.includes('pedido') || message.includes('orden') || message.includes('order') || message.includes('rastreo') || message.includes('track')) {
  intent = 'order_status';
  response = orderNumber
    ? `🔍 Perfecto, déjame verificar el estado de tu orden #${orderNumber}. Un momento por favor...\n\n_Nota: Esta es una respuesta automática. Para información exacta, escribe 9 para hablar con un agente._`
    : '🔍 Para revisar tu pedido necesito el número de orden. Lo encuentras en tu correo de confirmación (ejemplo: #12345).\n\n_Escribe MENU para más opciones._';
} else if (message.includes('pago') || message.includes('cobro') || message.includes('tarjeta') || message.includes('factura')) {
  intent = 'billing';
  response = '💳 Te ayudo con temas de facturación. ¿Cuál es tu consulta específica? (problemas de cobro, solicitud de factura, métodos de pago, etc.)\n\n_Escribe MENU para más opciones._';
} else if (message.includes('cuenta') || message.includes('perfil') || message.includes('contraseña') || message.includes('login')) {
  intent = 'account';
  response = '👤 Para asistencia con tu cuenta, puedo ayudarte con:\n\n• Recuperar contraseña\n• Actualizar información\n• Problemas de acceso\n\n¿Qué necesitas?\n\n_Escribe MENU para más opciones._';
} else if (message.includes('disponib') || message.includes('stock') || message.includes('hay')) {
  intent = 'availability';
  response = '📊 Para verificar disponibilidad, necesito saber qué producto te interesa. ¿Me puedes compartir el nombre o enlace?\n\n_Escribe MENU para más opciones._';
} else if (message.includes('queja') || message.includes('reclam') || message.includes('problema') || isNegative) {
  intent = 'complaint';
  needsHuman = true;
  response = `😔 Lamento mucho que hayas tenido una mala experiencia, ${senderName}. Tu satisfacción es muy importante.\n\n${isBusinessHours ? '🙋 Te estoy conectando con un supervisor ahora mismo. Por favor describe el problema detalladamente.' : '⏰ Un supervisor revisará tu caso mañana en horario laboral (Lun-Vie 9am-6pm). Por favor describe qué sucedió.'}\n\nCuéntame todos los detalles para resolverlo cuanto antes.`;
} else if (message.includes('horario') || message.includes('schedule') || message.includes('abierto')) {
  intent = 'hours';
  response = '🕐 Nuestro horario de atención es:\n\nLunes a Viernes: 9:00 AM - 6:00 PM (Hora Costa Rica)\nSábados y Domingos: Cerrado\n\n¿En qué más puedo ayudarte?\n\n_Escribe MENU para más opciones._';
} else if (message.includes('ayuda') || message.includes('help') || message.includes('soporte') || message.includes('support')) {
  intent = 'support';
  response = '🆘 Estoy aquí para ayudarte.\n\n📋 Escribe *MENU* para ver todas las opciones, o elige:\n\n• Estado de pedidos 📦\n• Envíos y entregas 🚚\n• Devoluciones 🔄\n• Información de productos 🛍️\n• Facturación 💳\n• Hablar con agente 🙋 (escribe 9)\n\n¿Qué necesitas?';
} else if (message.includes('gracias') || message.includes('thank')) {
  intent = 'thanks';
  response = '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?\n\n_Escribe MENU para ver opciones o 9 para hablar con un agente._';
} else if (message.includes('adios') || message.includes('adiós') || message.includes('bye') || message.includes('chao')) {
  intent = 'goodbye';
  response = '¡Hasta pronto! 👋 Que tengas un excelente día.\n\nEstamos aquí cuando nos necesites. Escribe *HOLA* cuando regreses.';
} else {
  intent = 'general';
  response = `Hola ${senderName}, gracias por escribirnos. 😊\n\n📋 Escribe *MENU* para ver todas las opciones de ayuda.\n\nO cuéntame directamente: ¿En qué puedo ayudarte hoy?`;
}

// Add urgency flag if detected
if (isUrgent && isBusinessHours && !needsHuman) {
  response += '\n\n⚡ Veo que es urgente. Escribe *9* o *AGENTE* para conectar con un humano de inmediato.';
  needsHuman = true;
}

return {
  conversation_id: conversationId,
  account_id: accountId,
  inbox_id: inboxId,
  inbox_name: inbox.name,
  sender_name: senderName,
  original_message: body.content,
  intent: intent,
  response_text: response,
  is_urgent: isUrgent,
  is_negative: isNegative,
  order_number: orderNumber,
  needs_human: needsHuman,
  business_hours: isBusinessHours
};
