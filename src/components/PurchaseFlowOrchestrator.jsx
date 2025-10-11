import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import SeatSelectorSimplified from './SeatSelectorSimplified';
import FoodSelectorEnhanced from './FoodSelectorEnhanced';
import PaymentStep from './PaymentStep';
import PurchaseBreadcrumbReact from './PurchaseBreadcrumbReact';

export default function PurchaseFlowOrchestrator({ funcion, salaInfo, boletosOcupados, usuario }) {
  const [step, setStep] = useState('asientos');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [carritoAlimentos, setCarritoAlimentos] = useState({});
  const [alimentos, setAlimentos] = useState([]);
  
  const [ticketsPrice, setTicketsPrice] = useState(0);
  const [foodPrice, setFoodPrice] = useState(0);
  
  const PRECIO_POR_BOLETO = 15.00;

  const handleSeatsSelected = (seats) => {
    setSelectedSeats(seats);
    setTicketsPrice(seats.length * PRECIO_POR_BOLETO);
    setStep('confiteria');
  };

  const goBackToSeats = () => {
    setStep('asientos');
  };

  const handleContinueToPayment = (carrito, alimentosData) => {
    setCarritoAlimentos(carrito);
    setAlimentos(alimentosData);
    
    // Calcular precio de alimentos
    let totalFood = 0;
    for (const [alimentoId, cantidad] of Object.entries(carrito)) {
      const alimento = alimentosData.find(a => a.id === alimentoId);
      if (alimento && cantidad > 0) {
        totalFood += alimento.precio * cantidad;
      }
    }
    setFoodPrice(totalFood);
    setStep('pago');
  };

  const goBackToFood = () => {
    setStep('confiteria');
  };

  const handleFinalPurchase = async (paymentData) => {
    setIsLoading(true);

    try {
      const finalTotalPrice = ticketsPrice + foodPrice;

      // 1. Crear la compra
      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert({ 
          usuario_id: usuario.id, 
          monto_total: finalTotalPrice,
          metodo_pago: paymentData.paymentMethod,
          email_contacto: paymentData.customerData.email,
          telefono_contacto: paymentData.customerData.telefono,
          nombre_contacto: paymentData.customerData.nombre
        })
        .select()
        .single();

      if (compraError) throw compraError;

      // 2. Insertar boletos
      const boletosInsert = selectedSeats.map(seat => ({
        funcion_id: funcion.id,
        usuario_id: usuario.id,
        fila: seat.fila,
        asiento: seat.asiento,
      }));

      const { data: boletosCreados, error: boletosError } = await supabase
        .from('boletos')
        .insert(boletosInsert)
        .select();

      if (boletosError) throw boletosError;

      // 3. Crear detalles de compra para boletos
      const detallesBoletos = boletosCreados.map(boleto => ({
        compra_id: compra.id,
        boleto_id: boleto.id,
        cantidad: 1,
        subtotal: PRECIO_POR_BOLETO,
      }));

      const { error: detallesBoletosError } = await supabase
        .from('detalles_compra')
        .insert(detallesBoletos);

      if (detallesBoletosError) throw detallesBoletosError;

      // 4. Crear detalles de compra para alimentos (si hay)
      if (Object.keys(carritoAlimentos).length > 0) {
        const detallesAlimentos = [];
        for (const [alimentoId, cantidad] of Object.entries(carritoAlimentos)) {
          if (cantidad > 0) {
            const alimento = alimentos.find(a => a.id === alimentoId);
            if (alimento) {
              detallesAlimentos.push({
                compra_id: compra.id,
                alimento_id: alimentoId,
                cantidad: cantidad,
                subtotal: alimento.precio * cantidad,
              });
            }
          }
        }

        if (detallesAlimentos.length > 0) {
          const { error: detallesAlimentosError } = await supabase
            .from('detalles_compra')
            .insert(detallesAlimentos);

          if (detallesAlimentosError) throw detallesAlimentosError;
        }
      }

      setIsLoading(false);
      alert('¡Compra realizada con éxito! Revisa tu email para los detalles.');
      window.location.href = '/perfil';

    } catch (error) {
      console.error('Error al crear la compra:', error);
      setIsLoading(false);
      alert('Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div>
      {/* Breadcrumb visible en todos los pasos */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg">
        <PurchaseBreadcrumbReact currentStep={step} />
      </div>

      {step === 'asientos' && (
        <SeatSelectorSimplified
          funcion={funcion}
          salaInfo={salaInfo}
          boletosOcupados={boletosOcupados}
          onSeatsSelected={handleSeatsSelected}
        />
      )}

      {step === 'confiteria' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <button
            onClick={goBackToSeats}
            className="mb-6 flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver a selección de asientos</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Confitería</h2>
            <p className="text-gray-500">Añade productos a tu compra (opcional)</p>
          </div>

          <FoodSelectorEnhanced
            basePrice={ticketsPrice}
            selectedSeats={selectedSeats}
            onPurchase={handleContinueToPayment}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 'pago' && (
        <PaymentStep
          basePrice={ticketsPrice}
          foodPrice={foodPrice}
          totalPrice={ticketsPrice + foodPrice}
          selectedSeats={selectedSeats}
          carritoAlimentos={carritoAlimentos}
          alimentos={alimentos}
          onConfirmPurchase={handleFinalPurchase}
          onGoBack={goBackToFood}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}