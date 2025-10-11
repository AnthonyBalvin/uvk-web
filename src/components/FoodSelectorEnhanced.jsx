import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FoodSelectorEnhanced({ basePrice, selectedSeats, onPurchase, isLoading }) {
  const [alimentos, setAlimentos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlimentos() {
      setLoading(true);
      const { data, error } = await supabase.from('alimentos').select('*');
      if (!error && data) {
        setAlimentos(data);
      } else {
        console.error('Error fetching alimentos:', error);
      }
      setLoading(false);
    }
    fetchAlimentos();
  }, []);

  const handleCantidadChange = (alimento, delta) => {
    setCarrito(prev => {
      const nuevaCantidad = (prev[alimento.id] || 0) + delta;
      if (nuevaCantidad <= 0) {
        const { [alimento.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [alimento.id]: nuevaCantidad };
    });
  };

  // Calcular total de alimentos
  const totalAlimentos = Object.entries(carrito).reduce((total, [alimentoId, cantidad]) => {
    const alimento = alimentos.find(a => a.id === alimentoId);
    return total + (alimento ? alimento.precio * cantidad : 0);
  }, 0);

  const totalFinal = basePrice + totalAlimentos;

  const handleFinalizarCompra = () => {
    if (isLoading) return;
    // Pasamos tanto el carrito como los alimentos al paso de pago
    onPurchase(carrito, alimentos);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-600 mt-4">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Lista de Alimentos */}
      {alimentos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {alimentos.map((alimento) => {
            const cantidadEnCarrito = carrito[alimento.id] || 0;
            const subtotal = alimento.precio * cantidadEnCarrito;
            
            return (
              <div 
                key={alimento.id} 
                className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-red-400 hover:-translate-y-1"
              >
                {/* Imagen del producto */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {alimento.imagen_url ? (
                    <img 
                      src={alimento.imagen_url} 
                      alt={alimento.nombre} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Badge de cantidad si está en el carrito */}
                  {cantidadEnCarrito > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg animate-pulse">
                      {cantidadEnCarrito}
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{alimento.nombre}</h3>
                  {alimento.descripcion && (
                    <p className="text-sm text-gray-500 mb-3 h-10 line-clamp-2">{alimento.descripcion}</p>
                  )}
                  
                  {/* Precio */}
                  <div className="flex items-center justify-center mb-4 bg-red-50 rounded-lg py-2">
                    <span className="text-red-600 font-bold text-2xl">S/ {alimento.precio.toFixed(2)}</span>
                  </div>
                  
                  {/* Controles de cantidad */}
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <button
                      onClick={() => handleCantidadChange(alimento, -1)}
                      disabled={cantidadEnCarrito === 0}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white w-11 h-11 rounded-xl font-bold text-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none active:scale-95"
                    >
                      −
                    </button>
                    <div className="bg-gray-100 rounded-xl px-5 py-2 min-w-[60px] text-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {cantidadEnCarrito}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCantidadChange(alimento, 1)}
                      className="bg-green-500 hover:bg-green-600 text-white w-11 h-11 rounded-xl font-bold text-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Subtotal */}
                  {cantidadEnCarrito > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                        <span className="font-bold text-lg text-green-600">
                          S/ {subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg mb-8">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 font-medium">No hay productos disponibles en este momento</p>
          <p className="text-gray-500 text-sm mt-2">Puedes continuar sin añadir productos</p>
        </div>
      )}

      {/* Resumen de Compra */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumen de tu Compra</h3>
        
        {/* Detalle de Boletos */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <div>
              <p className="font-semibold text-gray-900">Boletos</p>
              <p className="text-sm text-gray-600">
                Asientos: {selectedSeats.map(s => s.id).join(', ')}
              </p>
            </div>
            <span className="font-bold text-gray-900">S/ {basePrice.toFixed(2)}</span>
          </div>

          {/* Detalle de Alimentos */}
          {Object.keys(carrito).length > 0 && (
            <div className="pb-3 border-b">
              <p className="font-semibold text-gray-900 mb-2">Confitería</p>
              {Object.entries(carrito).map(([alimentoId, cantidad]) => {
                const alimento = alimentos.find(a => a.id === alimentoId);
                if (!alimento || cantidad === 0) return null;
                return (
                  <div key={alimentoId} className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600">
                      {cantidad}x {alimento.nombre}
                    </span>
                    <span className="text-gray-900 font-medium">
                      S/ {(alimento.precio * cantidad).toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                <span className="font-medium text-gray-700">Subtotal Confitería:</span>
                <span className="font-bold text-gray-900">S/ {totalAlimentos.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Total Final */}
          <div className="flex justify-between items-center pt-4">
            <span className="text-2xl font-bold text-gray-900">Total a Pagar:</span>
            <span className="text-3xl font-bold text-red-600">S/ {totalFinal.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3 mt-6">
          <button
            onClick={handleFinalizarCompra}
            disabled={isLoading}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>Continuar al Pago</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {Object.keys(carrito).length === 0 && (
            <p className="text-center text-sm text-gray-500">
              No has añadido productos de confitería. Puedes continuar sin añadir productos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}