// src/components/UpdatePasswordForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UpdatePasswordForm = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('¡Tu contraseña ha sido actualizada con éxito!');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Crea una nueva contraseña</h1>
            <p className="mt-2 text-gray-600">Asegúrate de que sea segura y fácil de recordar.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="password">Nueva Contraseña</label>
                <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
        </form>
        {message && <p className="text-center text-sm font-medium text-green-600">{message}</p>}
        {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
         <div className="text-center">
            <a href="/login" className="font-semibold text-red-600 hover:text-red-500 text-sm">
            Ir a Iniciar Sesión
            </a>
        </div>
    </div>
  );
};

export default UpdatePasswordForm;