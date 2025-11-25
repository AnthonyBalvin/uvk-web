import type { APIRoute } from 'astro'

// WSDL simple para dos operaciones de listado: ListarPeliculas y ListarCines
export const GET: APIRoute = async ({ request }) => {
  const origin = new URL(request.url).origin
  const serviceLocation = `${origin}/api/soap`

  const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions 
  xmlns="http://schemas.xmlsoap.org/wsdl/" 
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
  xmlns:xs="http://www.w3.org/2001/XMLSchema" 
  xmlns:tns="http://uvk.example.com/soap" 
  targetNamespace="http://uvk.example.com/soap">

  <types>
    <xs:schema targetNamespace="http://uvk.example.com/soap" elementFormDefault="qualified">
      <!-- Tipos comunes de paginación -->
      <xs:complexType name="Pagination">
        <xs:sequence>
          <xs:element name="page" type="xs:int" minOccurs="0"/>
          <xs:element name="pageSize" type="xs:int" minOccurs="0"/>
        </xs:sequence>
      </xs:complexType>

      <!-- Pelicula -->
      <xs:complexType name="Pelicula">
        <xs:sequence>
          <xs:element name="id" type="xs:string"/>
          <xs:element name="titulo" type="xs:string"/>
          <xs:element name="genero" type="xs:string" minOccurs="0"/>
          <xs:element name="duracion" type="xs:int" minOccurs="0"/>
        </xs:sequence>
      </xs:complexType>

      <!-- Cine -->
      <xs:complexType name="Cine">
        <xs:sequence>
          <xs:element name="id" type="xs:string"/>
          <xs:element name="nombre" type="xs:string"/>
          <xs:element name="ciudad" type="xs:string" minOccurs="0"/>
        </xs:sequence>
      </xs:complexType>

      <!-- Requests -->
      <xs:element name="ListarPeliculasRequest">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="page" type="xs:int" minOccurs="0"/>
            <xs:element name="pageSize" type="xs:int" minOccurs="0"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>

      <xs:element name="ListarCinesRequest">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="page" type="xs:int" minOccurs="0"/>
            <xs:element name="pageSize" type="xs:int" minOccurs="0"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>

      <!-- Responses -->
      <xs:element name="ListarPeliculasResponse">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="total" type="xs:int"/>
            <xs:element name="page" type="xs:int"/>
            <xs:element name="pageSize" type="xs:int"/>
            <xs:element name="items" minOccurs="0">
              <xs:complexType>
                <xs:sequence>
                  <xs:element name="item" type="tns:Pelicula" maxOccurs="unbounded" minOccurs="0"/>
                </xs:sequence>
              </xs:complexType>
            </xs:element>
          </xs:sequence>
        </xs:complexType>
      </xs:element>

      <xs:element name="ListarCinesResponse">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="total" type="xs:int"/>
            <xs:element name="page" type="xs:int"/>
            <xs:element name="pageSize" type="xs:int"/>
            <xs:element name="items" minOccurs="0">
              <xs:complexType>
                <xs:sequence>
                  <xs:element name="item" type="tns:Cine" maxOccurs="unbounded" minOccurs="0"/>
                </xs:sequence>
              </xs:complexType>
            </xs:element>
          </xs:sequence>
        </xs:complexType>
      </xs:element>

    </xs:schema>
  </types>

  <!-- Mensajes -->
  <message name="ListarPeliculasRequestMessage">
    <part name="parameters" element="tns:ListarPeliculasRequest"/>
  </message>
  <message name="ListarPeliculasResponseMessage">
    <part name="parameters" element="tns:ListarPeliculasResponse"/>
  </message>

  <message name="ListarCinesRequestMessage">
    <part name="parameters" element="tns:ListarCinesRequest"/>
  </message>
  <message name="ListarCinesResponseMessage">
    <part name="parameters" element="tns:ListarCinesResponse"/>
  </message>

  <!-- PortType -->
  <portType name="UVKServicePortType">
    <operation name="ListarPeliculas">
      <input message="tns:ListarPeliculasRequestMessage"/>
      <output message="tns:ListarPeliculasResponseMessage"/>
    </operation>
    <operation name="ListarCines">
      <input message="tns:ListarCinesRequestMessage"/>
      <output message="tns:ListarCinesResponseMessage"/>
    </operation>
  </portType>

  <!-- Binding -->
  <binding name="UVKServiceBinding" type="tns:UVKServicePortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="ListarPeliculas">
      <soap:operation soapAction="ListarPeliculas"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="ListarCines">
      <soap:operation soapAction="ListarCines"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <!-- Servicio -->
  <service name="UVKService">
    <port name="UVKServicePort" binding="tns:UVKServiceBinding">
      <soap:address location="${serviceLocation}"/>
    </port>
  </service>
</definitions>`

  return new Response(wsdl, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' }
  })
}
