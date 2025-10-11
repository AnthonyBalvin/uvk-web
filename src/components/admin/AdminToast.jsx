import React, { useEffect, useState } from 'react';

export default function AdminToast({ message, type, onHide }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10);
    
    // Iniciar animación de salida
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);

    // Ocultar completamente
    const hideTimer = setTimeout(() => {
      onHide();
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [onHide]);

  const isSuccess = type === 'success';

  return (
    <div 
      className={`fixed top-8 right-8 z-[9999] transition-all duration-300 ease-out ${
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="relative">
        {/* Toast Principal */}
        <div className={`
          min-w-[320px] max-w-md
          bg-white rounded-2xl shadow-2xl 
          border-l-4 
          ${isSuccess ? 'border-emerald-500' : 'border-red-500'}
          overflow-hidden
          backdrop-blur-sm
        `}>
          
          {/* Barra de progreso animada */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <div 
              className={`h-full ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{
                animation: 'progress 3s linear forwards'
              }}
            />
          </div>

          {/* Contenido */}
          <div className="flex items-start gap-4 p-4 pt-5">
            {/* Icono con animación */}
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              ${isSuccess 
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' 
                : 'bg-gradient-to-br from-red-50 to-red-100'
              }
              shadow-sm
            `}>
              {isSuccess ? (
                <svg 
                  className="w-6 h-6 text-emerald-600 animate-scale-in" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M5 13l4 4L19 7"
                    className="animate-draw-check"
                  />
                </svg>
              ) : (
                <svg 
                  className="w-6 h-6 text-red-600 animate-scale-in" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              )}
            </div>

            {/* Mensaje */}
            <div className="flex-1 pt-1">
              <p className={`
                text-sm font-semibold mb-0.5
                ${isSuccess ? 'text-emerald-900' : 'text-red-900'}
              `}>
                {isSuccess ? '¡Éxito!' : '¡Error!'}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => {
                setIsExiting(true);
                setTimeout(onHide, 300);
              }}
              className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group"
              aria-label="Cerrar notificación"
            >
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Sombra de fondo decorativa */}
        <div className={`
          absolute inset-0 -z-10 blur-2xl opacity-30
          ${isSuccess ? 'bg-emerald-400' : 'bg-red-400'}
        `} />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes draw-check {
          0% {
            stroke-dasharray: 0, 100;
          }
          100% {
            stroke-dasharray: 100, 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-draw-check {
          stroke-dasharray: 100;
          animation: draw-check 0.5s ease-out 0.2s forwards;
        }
      `}</style>
    </div>
  );
}