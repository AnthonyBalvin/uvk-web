// Cliente SOAP muy simple usando fetch.
// Provee funciones listarPeliculas y listarCines.

function buildEnvelope(operation, params = {}) {
  const { page = 1, pageSize = 10 } = params
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://uvk.example.com/soap">
  <soap:Body>
    <tns:${operation}Request>
      <page>${page}</page>
      <pageSize>${pageSize}</pageSize>
    </tns:${operation}Request>
  </soap:Body>
</soap:Envelope>`
}

async function callSoap(operation, params) {
  const xml = buildEnvelope(operation, params)
  const res = await fetch('/api/soap', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': operation
    },
    body: xml
  })

  const text = await res.text()

  // Parseo muy básico de XML a JSON-like (sin librerías)
  // Solo extraemos total, page, pageSize y items con campos conocidos.
  const getTag = (t) => {
    const m = text.match(new RegExp(`<${t}>([\s\S]*?)</${t}>`))
    return m ? m[1] : null
  }
  const total = parseInt(getTag('total') || '0', 10)
  const page = parseInt(getTag('page') || '1', 10)
  const pageSize = parseInt(getTag('pageSize') || '10', 10)

  const itemsBlock = getTag('items') || ''
  const itemRegex = /<item>[\s\S]*?<\/item>/g
  const itemBlocks = itemsBlock.match(itemRegex) || []

  const items = itemBlocks.map((block) => {
    const get = (t) => {
      const m = block.match(new RegExp(`<${t}>([\s\S]*?)</${t}>`))
      return m ? m[1] : null
    }
    if (operation === 'ListarPeliculas') {
      return {
        id: get('id'),
        titulo: get('titulo'),
        genero: get('genero'),
        duracion: get('duracion') ? parseInt(get('duracion'), 10) : null
      }
    }
    return {
      id: get('id'),
      nombre: get('nombre'),
      ciudad: get('ciudad')
    }
  })

  return { total, page, pageSize, items, raw: text }
}

export async function listarPeliculas(params) {
  return callSoap('ListarPeliculas', params)
}

export async function listarCines(params) {
  return callSoap('ListarCines', params)
}
