import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_KEY
)

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const preferenceId = url.searchParams.get('preference_id')
    const paymentId = url.searchParams.get('payment_id')

    if (!preferenceId && !paymentId) {
      return new Response(
        JSON.stringify({ error: 'Missing preference_id or payment_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Buscar la compra en la base de datos
    let query = supabase.from('compras').select('*')

    if (preferenceId) {
      query = query.eq('mp_preference_id', preferenceId)
    } else if (paymentId) {
      query = query.eq('mp_payment_id', paymentId)
    }

    const { data: compra, error } = await query.single()

    if (error || !compra) {
      return new Response(
        JSON.stringify({ error: 'Compra no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: compra.mp_payment_status || 'pending',
        compra_id: compra.id,
        monto: compra.monto_total
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error verificando pago:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}