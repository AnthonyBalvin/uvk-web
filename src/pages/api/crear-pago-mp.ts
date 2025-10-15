import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'

// Crear cliente con service role para el servidor
const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
)

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { 
      compraId, 
      totalPrice, 
      customerData, 
      selectedSeats,
      carritoAlimentos 
    } = body

    // Validar datos
    if (!compraId || !totalPrice || !customerData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const MP_ACCESS_TOKEN = import.meta.env.MERCADOPAGO_ACCESS_TOKEN
    if (!MP_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token de Mercado Pago no configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Crear preferencia en Mercado Pago
    const preference = {
      items: [
        {
          title: `Boletos UVK Cines - Asientos: ${selectedSeats.map(s => s.id).join(', ')}`,
          quantity: 1,
          unit_price: totalPrice,
          currency_id: 'PEN'
        }
      ],
      payer: {
        name: customerData.nombre,
        email: customerData.email,
        phone: {
          area_code: '51',
          number: customerData.telefono
        }
      },
      back_urls: {
        success: `${new URL(request.url).origin}/pago-exitoso`,
        failure: `${new URL(request.url).origin}/pago-fallido`,
        pending: `${new URL(request.url).origin}/pago-pendiente`
      },
      notification_url: import.meta.env.PUBLIC_WEBHOOK_URL || `${new URL(request.url).origin}/api/webhook-mp`,
      external_reference: compraId.toString(),
      statement_descriptor: 'UVK CINES',
      metadata: {
        compra_id: compraId,
        asientos: selectedSeats.map(s => s.id).join(','),
        alimentos: JSON.stringify(carritoAlimentos)
      }
    }

    // Llamar a API de Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json()
      console.error('Error completo de Mercado Pago:', JSON.stringify(errorData, null, 2))
      
      // Extraer mensaje de error más específico
      const errorMessage = errorData.message || errorData.error || 'Error desconocido'
      const errorCause = errorData.cause ? ` - ${JSON.stringify(errorData.cause)}` : ''
      
      throw new Error(`Mercado Pago rechazó la solicitud: ${errorMessage}${errorCause}`)
    }

    const mpData = await mpResponse.json()

    // Actualizar compra en Supabase
    const { error: updateError } = await supabase
      .from('compras')
      .update({
        mp_preference_id: mpData.id,
        mp_init_point: mpData.init_point,
        mp_qr_code_base64: mpData.sandbox_init_point || mpData.init_point
      })
      .eq('id', compraId)

    if (updateError) {
      console.error('Error al actualizar compra:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        preference_id: mpData.id,
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        qr_code: mpData.sandbox_init_point || mpData.init_point
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}