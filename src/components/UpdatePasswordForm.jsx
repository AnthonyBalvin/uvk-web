// src/components/UpdatePasswordForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UpdatePasswordForm = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- NUEVO ESTADO: Para saber si la sesión de recuperación está lista ---
  const [isSessionReady, setIsSessionReady] = useState(false);

  // --- NUEVO useEffect: Nuestro "vigilante" que espera la señal de Supabase ---
  useEffect(() => {
    // Escuchamos el evento que se dispara cuando Supabase procesa el token.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // ¡Señal recibida! La sesión temporal está lista. Activamos el formulario.
        setIsSessionReady(true);
      }
    });

    return () => {
      // Limpiamos el vigilante cuando el componente se desmonta.
      subscription.unsubscribe();
    };
  }, []); // Se ejecuta solo una vez al cargar el componente.


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(`Error: ${error.message}`);
    } else {
      setMessage('¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Crea una nueva contraseña</h1>
            <p className="mt-2 text-gray-600">
                {isSessionReady ? 'Asegúrate de que sea segura y fácil de recordar.' : 'Verificando enlace...'}
            </p>
        </div>

        {/* --- LÓGICA CONDICIONAL: Mostramos el formulario solo si la sesión está lista --- */}
        {isSessionReady ? (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Nueva Contraseña</label>
                    <div className="relative mt-1">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? ( <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> ) : ( <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> )}
                        </button>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50">
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </form>
        ) : (
            <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        )}

        {message && <p className="text-center text-sm font-medium text-green-600">{message}</p>}
        {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
         <div className="text-center pt-4">
            <a href="/login" className="font-semibold text-red-600 hover:text-red-500 text-sm">
            Ir a Iniciar Sesión
            </a>
        </div>
    </div>
  );
};

export default UpdatePasswordForm;