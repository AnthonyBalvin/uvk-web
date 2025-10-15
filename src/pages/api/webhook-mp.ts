import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'

// Crear cliente de Supabase (usa la service role key)
const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
)

export const POST: APIRoute = async ({ request }) => {
  try {
    // Leer el cuerpo crudo y loguearlo
    const rawBody = await request.text()
    console.log('🔔 Webhook recibido crudo:', rawBody)

    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      console.error('❌ Error al parsear JSON')
      return new Response('Invalid JSON', { status: 400 })
    }

    console.log('🔔 Webhook parseado:', body)

    const { type, data } = body

    // Ignorar simulaciones de Mercado Pago (como el test con id 123456)
    if (data?.id === "123456") {
      console.log("⚠️ Ignorando simulación de Mercado Pago (id=123456)")
      return new Response("ok", { status: 200 })
    }

    // Ignorar otros tipos de eventos
    if (type !== 'payment') {
      console.log('⚠️ Tipo de notificación ignorado:', type)
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Procesar pago
    const paymentId = data.id
    const MP_ACCESS_TOKEN = import.meta.env.MERCADOPAGO_ACCESS_TOKEN

    console.log('💳 Consultando pago ID:', paymentId)

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    )

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      console.error('❌ Error al obtener pago:', paymentResponse.status, errorText)
      return new Response('Error consultando pago', { status: 502 })
    }

    const payment = await paymentResponse.json()
    console.log('📄 Datos del pago:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference
    })

    const compraId = payment.external_reference
    if (!compraId) {
      console.error('❌ No se encontró external_reference')
      return new Response('No external_reference', { status: 400 })
    }

    // Actualizar en Supabase
    const updateData = {
      mp_payment_id: payment.id?.toString(),
      mp_payment_status: payment.status,
      metodo_pago: payment.payment_method_id || 'mercadopago'
    }

    console.log('💾 Actualizando compra:', compraId, updateData)

    const { error: updateError } = await supabase
      .from('compras')
      .update(updateData)
      .eq('id', compraId)

    if (updateError) {
      console.error('❌ Error al actualizar compra:', updateError)
      return new Response('Error actualizando compra', { status: 500 })
    }

    console.log('✅ Compra actualizada correctamente:', compraId)
    return new Response('ok', { status: 200 })
  } catch (error) {
    console.error('💥 Error inesperado en webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
