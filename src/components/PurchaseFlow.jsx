//Este codigo es de src/components/PurchaseFlow.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PurchaseFlow({ peliculaId }) {
  const [funciones, setFunciones] = useState([]);
  const [selectedCine, setSelectedCine] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFunciones = async () => {
      const { data, error } = await supabase
        .from('funciones')
        .select('id, fecha_hora, cines(id, nombre)')
        .eq('pelicula_id', peliculaId)
        .order('fecha_hora', { ascending: true });

      if (error) {
        setError('No se pudieron cargar las funciones.');
      } else {
        setFunciones(data);
      }
    };
    fetchFunciones();
  }, [peliculaId]);

  const cinesDisponibles = [...new Map(funciones.map(item => [item.cines.id, item.cines])).values()];
  const fechasDisponibles = selectedCine
    ? [...new Set(funciones.filter(f => f.cines.id === selectedCine).map(f => new Date(f.fecha_hora).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })))] 
    : [];
  const horariosDisponibles = (selectedCine && selectedDate)
    ? funciones.filter(f => f.cines.id === selectedCine && new Date(f.fecha_hora).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) === selectedDate) 
    : [];

  const handleTimeSelection = (funcionId) => {
    window.location.href = `/seleccionar-asientos/${funcionId}`;
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Comprar Entradas</h3>
            <p className="text-red-100 text-sm">Selecciona tu función preferida</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {/* Paso 1: Selección de Cine */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <label htmlFor="cine-select" className="text-lg font-bold text-gray-900">
              Elige un cine
            </label>
          </div>
          <div className="relative">
            <select 
              id="cine-select" 
              value={selectedCine} 
              onChange={(e) => { 
                setSelectedCine(e.target.value); 
                setSelectedDate(''); 
              }} 
              className="w-full bg-white text-gray-900 p-4 pr-10 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer transition-all hover:border-gray-300"
            >
              <option value="">Selecciona un cine</option>
              {cinesDisponibles.map(cine => (
                <option key={cine.id} value={cine.id}>{cine.nombre}</option>
              ))}
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Paso 2: Selección de Fecha */}
        {selectedCine && (
          <div className="mb-6 animate-fadeIn">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <label htmlFor="fecha-select" className="text-lg font-bold text-gray-900">
                Elige una fecha
              </label>
            </div>
            <div className="relative">
              <select 
                id="fecha-select" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="w-full bg-white text-gray-900 p-4 pr-10 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer transition-all hover:border-gray-300"
              >
                <option value="">Selecciona una fecha</option>
                {fechasDisponibles.map(fecha => (
                  <option key={fecha} value={fecha}>{fecha}</option>
                ))}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* Paso 3: Selección de Horario */}
        {selectedDate && (
          <div className="animate-fadeIn">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <p className="text-lg font-bold text-gray-900">
                Elige un horario
              </p>
            </div>
            
            {horariosDisponibles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {horariosDisponibles.map(funcion => (
                  <button
                    key={funcion.id}
                    onClick={() => handleTimeSelection(funcion.id)}
                    className="group relative p-4 rounded-xl border-2 border-gray-200 font-bold transition-all duration-200 bg-white hover:bg-red-600 hover:border-red-600 hover:shadow-lg hover:scale-105 text-gray-800 hover:text-white"
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg">
                        {new Date(funcion.fecha_hora).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          timeZone: 'UTC' 
                        })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
              </div>
            )}
          </div>
        )}

        {/* Indicador de progreso */}
        {!selectedCine && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 font-medium">Comienza seleccionando un cine</p>
          </div>
        )}
      </div>
    </div>
  );
}