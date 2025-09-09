import React, { useState } from 'react';
// import { supabase } from '../lib/supabaseClient';

const UpdatePasswordForm = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1500));
    if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
    } else {
        setMessage('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Paso Final</h1>
                <p className="text-gray-600 max-w-sm">
                    Estás a solo un paso de recuperar el acceso. Elige una contraseña fuerte y memorable.
                </p>
            </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Crea una Nueva Contraseña
                    </h1>
                    <p className="mt-3 text-gray-600">
                        Asegúrate de que sea segura y fácil de recordar para ti.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                         <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">Nueva Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            {/* INPUT CON EL NUEVO COLOR DE FOCUS */}
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-200/50 text-gray-900 placeholder-gray-400 transition-all duration-300 bg-gray-50 hover:bg-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            {/* ICONO CON EL NUEVO COLOR DE HOVER */}
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
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
                            <span>Actualizando...</span>
                            </>
                        ) : (
                            <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <span>Actualizar Contraseña</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 space-y-4">
                    {message && <p className="text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}
                    {error && <p className="text-center text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                </div>

                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                    {/* LINK CON EL NUEVO COLOR */}
                    <a href="/login" className="font-semibold text-red-700 hover:text-red-800 text-sm transition-colors">
                    Ir a Iniciar Sesión
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UpdatePasswordForm;