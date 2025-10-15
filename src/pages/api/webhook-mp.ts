import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuración de Supabase
const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- INICIO: Lógica de Validación de Firma ---
// Esta función verifica que la petición viene realmente de Mercado Pago
async function validateSignature(request: Request, bodyText: string) {
  const webhookSecret = import.meta.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ MERCADOPAGO_WEBHOOK_SECRET no está configurado.');
    return false;
  }

  const signatureHeader = request.headers.get('x-signature');
  if (!signatureHeader) {
    console.warn('⚠️ Petición de Webhook sin cabecera x-signature.');
    return false;
  }

  const parts = signatureHeader.split(',');
  const tsPart = parts.find(p => p.startsWith('ts='));
  const hashPart = parts.find(p => p.startsWith('v1='));

  if (!tsPart || !hashPart) {
    console.warn('⚠️ Cabecera x-signature con formato incorrecto.');
    return false;
  }

  const timestamp = tsPart.split('=')[1];
  const receivedHash = hashPart.split('=')[1];

  const manifest = `id:${bodyText.match(/"id":(\d+)/)?.[1]};request-id:${request.headers.get('x-request-id')};ts:${timestamp};`;

  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(manifest);
  const computedHash = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(receivedHash));
}
// --- FIN: Lógica de Validación de Firma ---

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };
  
  try {
    console.log('==========================================');
    console.log('🔔 WEBHOOK INICIADO');

    const bodyText = await request.text(); // Leemos como texto primero para la firma
    const body = JSON.parse(bodyText);
    
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2));

    // Validamos la firma de Mercado Pago (ignorado en desarrollo local)
    if (import.meta.env.PROD) {
      const isValid = await validateSignature(request, bodyText);
      if (!isValid) {
        console.error('❌ FIRMA DE WEBHOOK NO VÁLIDA.');
        return new Response(JSON.stringify({ error: 'Firma inválida' }), { status: 401, headers });
      }
      console.log('✅ Firma de Webhook validada correctamente.');
    }

    const { type, data } = body;
    if (type !== 'payment') {
      console.log('⚠️ Tipo ignorado:', type);
      return new Response(JSON.stringify({ received: true }), { status: 200, headers });
    }

    const paymentId = data.id;
    console.log('💳 Payment ID:', paymentId);

    const MP_ACCESS_TOKEN = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
    
    // ... el resto del código es igual ...
    console.log('📡 Consultando Mercado Pago...');
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` } }
    );
    
    if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('❌ Error de MP:', errorText);
        throw new Error('Error al obtener datos del pago');
    }

    const payment = await paymentResponse.json();
    console.log('💰 Pago obtenido:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference
    });

    const compraId = payment.external_reference;
    if (!compraId) {
      console.error('❌ No hay external_reference');
      return new Response(JSON.stringify({ error: 'No external_reference' }), { status: 400, headers });
    }
    
    console.log('🎯 Compra ID a actualizar:', compraId);
    
    const updateData = {
        mp_payment_id: payment.id.toString(),
        mp_payment_status: payment.status,
        metodo_pago: payment.payment_method_id || 'mercadopago'
    };
    
    console.log('💾 Datos a actualizar:', updateData);
    
    const { error: updateError } = await supabase
      .from('compras')
      .update(updateData)
      .eq('id', compraId);
      
    if (updateError) {
      console.error('❌ ERROR AL ACTUALIZAR:', updateError);
      throw updateError;
    }
    
    console.log('✅ ACTUALIZACIÓN EXITOSA para compra ID:', compraId);
    console.log('==========================================');
    
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (error) {
    console.error('💥 ERROR GENERAL:', error);
    console.log('==========================================');
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers });
  }
};
