import React, { useState } from 'react';
// import { supabase } from '../lib/supabaseClient';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (email === "error@test.com") {
        setError("No se pudo enviar el correo. Inténtalo de nuevo.");
    } else {
        setMessage('Si tu cuenta existe, recibirás un enlace para recuperar tu contraseña.');
    }

    setLoading(false);
  };

  return (
    <div className="flex w-full min-h-screen font-sans text-gray-800">
      {/* Columna Izquierda - Decorativa */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-red-50 via-red-100 to-red-200 p-10 text-center">
        <div className="bg-white/30 backdrop-blur-lg p-12 rounded-3xl border border-white/40 shadow-xl">
          {/* ICONO CON EL NUEVO COLOR */}
          <div className="mx-auto w-24 h-24 mb-6 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
             <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Tu Seguridad es Primero</h1>
          <p className="text-gray-600 max-w-sm">
            Recupera el acceso a tu cuenta de forma rápida y segura. Unos pocos clics y estarás de vuelta.
          </p>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="mt-3 text-gray-600">
              No te preocupes. Ingresa tu correo y te enviaremos un enlace para recuperarla.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                {/* INPUT CON EL NUEVO COLOR DE FOCUS */}
                <input
                  id="email"
                  type="email"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-200/50 text-gray-900 placeholder-gray-400 transition-all duration-300 bg-gray-50 hover:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* BOTÓN CON EL NUEVO COLOR */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Enviar Enlace</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 space-y-4">
            {message && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            {/* LINK CON EL NUEVO COLOR */}
            <a href="/login" className="inline-flex items-center space-x-2 font-semibold text-red-700 hover:text-red-800 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver a Iniciar Sesión</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;