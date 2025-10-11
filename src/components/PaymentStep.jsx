import { useState } from 'react';

export default function PaymentStep({ 
  basePrice, 
  foodPrice, 
  totalPrice, 
  selectedSeats, 
  carritoAlimentos,
  alimentos,
  onConfirmPurchase, 
  onGoBack,
  isLoading 
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('efectivo');
  const [customerData, setCustomerData] = useState({
    email: '',
    telefono: '',
    nombre: ''
  });
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'efectivo',
      name: 'Efectivo en Cine',
      description: 'Paga al recoger tus boletos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'tarjeta',
      name: 'Tarjeta de Crédito/Débito',
      description: 'Visa, Mastercard, American Express',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'yape',
      name: 'Yape / Plin',
      description: 'Pago instantáneo con billetera digital',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!customerData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!customerData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!customerData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^9\d{8}$/.test(customerData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (debe ser 9 dígitos, ej: 987654321)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirmPurchase({
        paymentMethod: selectedPaymentMethod,
        customerData
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Botón Volver */}
        <button
          onClick={onGoBack}
          className="mb-6 flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver a confitería</span>
        </button>

        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirma tu Pago</h2>
          <p className="text-gray-500">Selecciona tu método de pago y confirma tu compra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda - Métodos de Pago y Datos */}
          <div className="space-y-6">
            {/* Métodos de Pago */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Método de Pago</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPaymentMethod === method.id
                        ? 'border-red-600 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${
                        selectedPaymentMethod === method.id
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de Datos del Cliente */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Datos de Contacto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customerData.nombre}
                    onChange={(e) => setCustomerData({ ...customerData, nombre: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      errors.nombre 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-red-500'
                    } focus:outline-none`}
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-red-500'
                    } focus:outline-none`}
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerData.telefono}
                    onChange={(e) => setCustomerData({ ...customerData, telefono: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                      errors.telefono 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-red-500'
                    } focus:outline-none`}
                    placeholder="987654321"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Resumen de Compra */}
          <div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen de Compra</h3>
              
              {/* Boletos */}
              <div className="mb-4 pb-4 border-b border-gray-300">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">Boletos</p>
                    <p className="text-sm text-gray-600">
                      Asientos: {selectedSeats.map(s => s.id).join(', ')}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">S/ {basePrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Confitería */}
              {Object.keys(carritoAlimentos).length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-300">
                  <p className="font-semibold text-gray-900 mb-2">Confitería</p>
                  {Object.entries(carritoAlimentos).map(([alimentoId, cantidad]) => {
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
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="font-bold text-gray-900">S/ {foodPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-white rounded-xl p-4 shadow-md mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total a Pagar:</span>
                  <span className="text-3xl font-bold text-red-600">S/ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Método de Pago Seleccionado */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Método de pago:</p>
                <p className="font-bold text-gray-900">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                </p>
              </div>

              {/* Botón de Confirmar */}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
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
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Confirmar Compra</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}