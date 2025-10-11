import { useState } from 'react';

const Seat = ({ status, fila, asiento, onClick }) => {
  const baseClasses = "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-semibold text-sm transition-all duration-200";
  let statusClasses = "";
  
  switch (status) {
    case 'ocupado': 
      statusClasses = "bg-gray-300 cursor-not-allowed text-gray-500 opacity-50"; 
      break;
    case 'seleccionado': 
      statusClasses = "bg-red-600 text-white scale-110 shadow-lg transform ring-2 ring-red-300"; 
      break;
    default: 
      statusClasses = "bg-white border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 cursor-pointer text-gray-700 hover:text-red-600 shadow-sm hover:shadow-md"; 
      break;
  }
  
  return (
    <button 
      onClick={onClick} 
      disabled={status === 'ocupado'} 
      className={`${baseClasses} ${statusClasses}`}
      aria-label={`Asiento ${fila}${asiento}`}
    >
      {asiento}
    </button>
  );
};

export default function SeatSelectorSimplified({ funcion, salaInfo, boletosOcupados, onSeatsSelected }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState('');
  
  const PRECIO_POR_BOLETO = 15.00;

  const handleSeatClick = (fila, asiento) => {
    const seatId = `${fila}${asiento}`;
    setSelectedSeats(prev => 
      prev.some(s => s.id === seatId)
        ? prev.filter(s => s.id !== seatId)
        : [...prev, { id: seatId, fila, asiento }]
    );
    setError('');
  };
  
  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setError('Debes seleccionar al menos un asiento.');
      return;
    }
    onSeatsSelected(selectedSeats);
  };
  
  const occupiedSet = new Set(boletosOcupados.map(b => `${b.fila}${b.asiento}`));
  const seatGrid = [];
  
  for (let i = 0; i < salaInfo.filas; i++) {
    const filaLabel = String.fromCharCode(65 + i);
    const rowSeats = [];
    for (let j = 1; j <= salaInfo.asientos_por_fila; j++) {
      const seatId = `${filaLabel}${j}`;
      let status = 'disponible';
      if (occupiedSet.has(seatId)) status = 'ocupado';
      else if (selectedSeats.some(s => s.id === seatId)) status = 'seleccionado';
      rowSeats.push(
        <Seat 
          key={seatId} 
          status={status} 
          fila={filaLabel} 
          asiento={j} 
          onClick={() => handleSeatClick(filaLabel, j)} 
        />
      );
    }
    seatGrid.push(
      <div key={filaLabel} className="flex items-center justify-center gap-2">
        <span className="w-10 font-bold text-gray-600 text-center text-sm">{filaLabel}</span>
        {rowSeats}
        <span className="w-10 font-bold text-gray-600 text-center text-sm">{filaLabel}</span>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #f8f5f0 0%, #f2ede6 100%)' }}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Info de la Función */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
            <div className="relative h-96 lg:h-auto">
              <img 
                src={funcion.pelicula.imagen_url} 
                alt={`Póster de ${funcion.pelicula.titulo}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">{funcion.pelicula.titulo}</h1>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Cine</p>
                  <p className="font-semibold text-gray-900">{funcion.cine.nombre}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(funcion.fecha_hora).toLocaleDateString('es-PE', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      timeZone: 'UTC' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(funcion.fecha_hora).toLocaleTimeString('es-PE', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      timeZone: 'UTC' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Sala</p>
                  <p className="font-semibold text-gray-900">{funcion.sala_info.nombre}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Área Principal - Selector de Asientos */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Selecciona tus Asientos</h2>
              <p className="text-gray-500">Haz clic en los asientos disponibles para reservarlos</p>
            </div>

            {/* Pantalla */}
            <div className="mb-8">
              <div className="w-full max-w-2xl mx-auto">
                <div className="h-3 bg-gradient-to-b from-gray-400 to-gray-200 rounded-t-full mb-2 shadow-md"></div>
                <p className="text-center text-sm text-gray-500 font-medium">PANTALLA</p>
              </div>
            </div>

            {/* Grid de Asientos */}
            <div className="overflow-x-auto pb-4">
              <div className="flex flex-col gap-2 min-w-fit mx-auto w-fit">
                {seatGrid}
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-gray-300 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 shadow-lg"></div>
                <span className="text-sm font-medium text-gray-700">Seleccionado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gray-300 opacity-50"></div>
                <span className="text-sm font-medium text-gray-700">Ocupado</span>
              </div>
            </div>

            {/* Resumen */}
            <div className="mt-8 border-t pt-6">
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de tu selección</h3>
                
                {selectedSeats.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Asientos seleccionados:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSeats.map(s => s.id).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-semibold text-gray-900">{selectedSeats.length} entrada(s)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Precio por entrada:</span>
                      <span className="font-semibold text-gray-900">S/ {PRECIO_POR_BOLETO.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total boletos:</span>
                      <span className="text-2xl font-bold text-red-600">
                        S/ {(selectedSeats.length * PRECIO_POR_BOLETO).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <p className="text-gray-500">No has seleccionado ningún asiento</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
              >
                <span>Continuar a Confitería</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}