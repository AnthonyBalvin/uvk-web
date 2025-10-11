export default function PurchaseBreadcrumbReact({ currentStep }) {
    const steps = [
      { id: 'horarios', title: '1. Horarios', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'asientos', title: '2. Asientos', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { id: 'confiteria', title: '3. Confitería', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
      { id: 'pago', title: '4. Pago', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
    ];
  
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
    return (
      <nav aria-label="Progreso de la compra" className="w-full">
        <ol className="flex items-center justify-between w-full max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <li key={step.id} className={`flex-1 flex items-center ${index < steps.length - 1 ? 'relative' : ''}`}>
                {index < steps.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                    <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                )}
                
                <div className="flex flex-col items-center relative z-10 w-full">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
                    isCurrent 
                      ? 'bg-red-600 text-white ring-4 ring-red-200 scale-110' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon}></path>
                      </svg>
                    )}
                  </div>
                  
                  <span className={`mt-2 text-xs sm:text-sm font-semibold text-center transition-colors duration-300 ${
                    isCurrent 
                      ? 'text-red-600' 
                      : isCompleted 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }