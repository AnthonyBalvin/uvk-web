import type { APIRoute } from 'astro'
import { supabase } from '../../lib/supabase'

// Implementación mínima de un endpoint SOAP con dos operaciones de listados
// - ListarPeliculas
// - ListarCines
// Este handler usa parseo simple por regex para detectar operación y parámetros.

function parseIntFromTag(xml: string, tag: string, def: number): number {
  const m = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`))
  if (!m) return def
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : def
}

function soapEnvelope(body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
${body}
  </soap:Body>
</soap:Envelope>`
}

async function buildPeliculasResponse(page: number, pageSize: number) {
  const from = Math.max((page - 1) * pageSize, 0)
  const to = from + Math.max(pageSize - 1, 0)

  const { data, count, error } = await supabase
    .from('peliculas')
    .select('id,titulo,genero,duracion', { count: 'exact' })
    .range(from, to)

  if (error) {
    throw new Error(`Error obteniendo peliculas: ${error.message}`)
  }
  const itemsXml = (data || [])
    .map(
      (it: any) => `        <item>
          <id>${it.id}</id>
          <titulo>${it.titulo ?? ''}</titulo>
          <genero>${it.genero ?? ''}</genero>
          <duracion>${it.duracion ?? ''}</duracion>
        </item>`
    )
    .join('\n')

  const total = count ?? (data ? data.length : 0)
  const body = `    <ListarPeliculasResponse xmlns="http://uvk.example.com/soap">
      <total>${total}</total>
      <page>${page}</page>
      <pageSize>${pageSize}</pageSize>
      <items>
${itemsXml}
      </items>
    </ListarPeliculasResponse>`
  return soapEnvelope(body)
}

async function buildCinesResponse(page: number, pageSize: number) {
  const from = Math.max((page - 1) * pageSize, 0)
  const to = from + Math.max(pageSize - 1, 0)

  const { data, count, error } = await supabase
    .from('cines')
    .select('id,nombre,ciudades:ciudad_id(nombre)', { count: 'exact' })
    .range(from, to)

  if (error) {
    throw new Error(`Error obteniendo cines: ${error.message}`)
  }
  const itemsXml = (data || [])
    .map((it: any) => {
      const ciudadNombre = it?.ciudades?.nombre ?? ''
      return `        <item>
          <id>${it.id}</id>
          <nombre>${it.nombre ?? ''}</nombre>
          <ciudad>${ciudadNombre}</ciudad>
        </item>`
    })
    .join('\n')

  const total = count ?? (data ? data.length : 0)
  const body = `    <ListarCinesResponse xmlns="http://uvk.example.com/soap">
      <total>${total}</total>
      <page>${page}</page>
      <pageSize>${pageSize}</pageSize>
      <items>
${itemsXml}
      </items>
    </ListarCinesResponse>`
  return soapEnvelope(body)
}

function fault(message: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>${message}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const xml = await request.text()
    const soapAction = request.headers.get('soapaction') || ''

    const page = parseIntFromTag(xml, 'page', 1)
    const pageSize = parseIntFromTag(xml, 'pageSize', 10)

    const isPeliculas = /ListarPeliculasRequest/.test(xml) || /ListarPeliculas/i.test(soapAction)
    const isCines = /ListarCinesRequest/.test(xml) || /ListarCines/i.test(soapAction)

    if (isPeliculas) {
      const responseXml = await buildPeliculasResponse(page, pageSize)
      return new Response(responseXml, { headers: { 'Content-Type': 'text/xml; charset=utf-8' } })
    }
    if (isCines) {
      const responseXml = await buildCinesResponse(page, pageSize)
      return new Response(responseXml, { headers: { 'Content-Type': 'text/xml; charset=utf-8' } })
    }

    return new Response(fault('Operación no soportada'), { status: 500, headers: { 'Content-Type': 'text/xml; charset=utf-8' } })
  } catch (e: any) {
    return new Response(fault(e?.message || 'Error interno'), { status: 500, headers: { 'Content-Type': 'text/xml; charset=utf-8' } })
  }
}

export const GET: APIRoute = async () => {
  // Opcional: pequeña ayuda para navegadores
  const help = `Servicio SOAP disponible. Obtén el WSDL en /api/soap.wsdl y envía POST XML a /api/soap.`
  return new Response(help, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
