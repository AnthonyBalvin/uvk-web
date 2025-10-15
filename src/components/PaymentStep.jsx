import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function PaymentStep({
  basePrice,
  foodPrice,
  totalPrice,
  selectedSeats,
  carritoAlimentos,
  alimentos,
  funcionId,
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

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
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Tarjetas, Yape, PagoEfectivo y más',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ];

  // ========== ESCUCHAR CAMBIOS EN TIEMPO REAL ==========
  useEffect(() => {
    if (!showQRModal || !paymentData?.compraId) {
      return;
    }

    console.log(`🎧 Suscribiéndose a cambios para compra ID: ${paymentData.compraId}`);

    // Crear canal de Supabase Realtime
    const channel = supabase
      .channel(`payment-changes-${paymentData.compraId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'compras',
          filter: `id=eq.${paymentData.compraId}`
        },
        (payload) => {
          console.log('✅ ¡Cambio detectado!', payload);
          
          const newStatus = payload.new.mp_payment_status;
          console.log('📊 Nuevo estado:', newStatus);
          
          setPaymentStatus(newStatus);

          if (newStatus === 'approved') {
            console.log('💚 ¡Pago aprobado! Cerrando modal en 1.5s...');
            
            setTimeout(() => {
              setShowQRModal(false);
              onConfirmPurchase({
                paymentMethod: selectedPaymentMethod,
                customerData,
                compraId: paymentData.compraId,
                paymentStatus: 'approved'
              });
            }, 1500);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscripción activa y escuchando cambios');
        }
      });

    // Cleanup: desuscribirse cuando se cierre el modal
    return () => {
      console.log(`🔌 Desuscribiéndose del canal`);
      supabase.removeChannel(channel);
    };
  }, [showQRModal, paymentData?.compraId]);

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

  const handleConfirm = async () => {
    if (!validateForm()) return;

    setProcessingPayment(true);

    try {
      // 1. Crear compra en la base de datos
      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert({
          usuario_id: null,
          monto_total: totalPrice,
          metodo_pago: selectedPaymentMethod,
          email_contacto: customerData.email,
          telefono_contacto: customerData.telefono,
          nombre_contacto: customerData.nombre,
          mp_payment_status: 'pending'
        })
        .select()
        .single();

      if (compraError) throw compraError;

      console.log('✅ Compra creada con ID:', compra.id);

      // 2. Crear boletos
      const boletosData = selectedSeats.map(seat => ({
        compra_id: compra.id,
        funcion_id: funcionId,
        asiento: typeof seat.id === 'string'
          ? parseInt(seat.id.match(/\d+/)?.[0] || seat.id)
          : seat.id,
        fila: typeof seat.id === 'string'
          ? seat.id.match(/[A-Z]/)?.[0] || seat.row
          : seat.row
      }));

      const { error: boletosError } = await supabase
        .from('boletos')
        .insert(boletosData);

      if (boletosError) throw boletosError;

      // 3. Crear detalle de alimentos si hay
      if (Object.keys(carritoAlimentos).length > 0) {
        const alimentosData = Object.entries(carritoAlimentos)
          .filter(([_, cantidad]) => cantidad > 0)
          .map(([alimentoId, cantidad]) => ({
            compra_id: compra.id,
            alimento_id: alimentoId,
            cantidad,
            subtotal: alimentos.find(a => a.id === alimentoId).precio * cantidad
          }));

        const { error: alimentosError } = await supabase
          .from('detalles_compra')
          .insert(alimentosData);

        if (alimentosError) throw alimentosError;
      }

      // 4. Si es efectivo, terminar aquí
      if (selectedPaymentMethod === 'efectivo') {
        onConfirmPurchase({
          paymentMethod: selectedPaymentMethod,
          customerData,
          compraId: compra.id
        });
        setProcessingPayment(false);
        return;
      }

      // 5. Si es Mercado Pago, crear preferencia
      if (selectedPaymentMethod === 'mercadopago') {
        const response = await fetch('/api/crear-pago-mp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            compraId: compra.id,
            totalPrice,
            customerData,
            selectedSeats,
            carritoAlimentos
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear el pago');
        }

        const mpData = await response.json();
        
        console.log('🔗 Preferencia de MP creada:', mpData.preference_id);
        
        setPaymentData({
          init_point: mpData.init_point,
          preference_id: mpData.preference_id,
          compraId: compra.id
        });
        
        setPaymentStatus('pending');
        setShowQRModal(true);
      }

    } catch (error) {
      console.error('❌ Error al procesar compra:', error);
      alert('Error al procesar la compra: ' + error.message);
    } finally {
      setProcessingPayment(false);
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
                disabled={processingPayment}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
              >
                {processingPayment ? (
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

      {/* Modal de Mercado Pago con Realtime */}
      {showQRModal && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              
              {/* Estado: Pendiente */}
              {paymentStatus === 'pending' && (
                <>
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Completa tu Pago
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Haz clic en el botón para ir a Mercado Pago
                  </p>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Serás redirigido a Mercado Pago de forma segura
                    </p>
                    <a
                      href={paymentData.init_point}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Ir a Mercado Pago</span>
                    </a>
                  </div>

                  {/* Indicador de espera en tiempo real */}
                  <div className="flex items-center justify-center space-x-2 text-gray-500 mb-4">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Esperando confirmación automática...</span>
                  </div>

                  <button
                    onClick={() => setShowQRModal(false)}
                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>

                  <p className="text-xs text-gray-500 mt-4">
                    ✨ Esta ventana se actualizará automáticamente cuando completes el pago
                  </p>
                </>
              )}

              {/* Estado: Aprobado */}
              {paymentStatus === 'approved' && (
                <>
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    ¡Pago Confirmado!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tu pago fue procesado exitosamente
                  </p>
                  <div className="animate-pulse text-sm text-gray-500">
                    Redirigiendo...
                  </div>
                </>
              )}

              {/* Estado: Rechazado */}
              {paymentStatus === 'rejected' && (
                <>
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-red-600 mb-2">
                    Pago Rechazado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    El pago no pudo ser procesado
                  </p>
                  
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      setPaymentStatus('pending');
                    }}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Intentar Nuevamente
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}