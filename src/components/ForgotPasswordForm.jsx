// src/components/ForgotPasswordForm.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, 
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Si existe una cuenta con este correo, recibirás un enlace para recuperar tu contraseña.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h1>
        <p className="mt-2 text-gray-600">No te preocupes. Ingresa tu correo y te enviaremos un enlace para recuperarla.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-500" // <-- CORREGIDO
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
   />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
        </button>
      </form>
      {message && <p className="text-center text-sm font-medium text-green-600">{message}</p>}
      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
      <div className="text-center">
        <a href="/login" className="font-semibold text-red-600 hover:text-red-500 text-sm">
          Volver a Iniciar Sesión
        </a>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;