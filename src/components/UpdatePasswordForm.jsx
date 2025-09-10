// src/components/UpdatePasswordForm.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UpdatePasswordForm = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar si hay una sesión activa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al verificar sesión:', error);
          setError('Error al verificar la sesión de autenticación.');
          setIsValidSession(false);
        } else if (session) {
          setIsValidSession(true);
        } else {
          // Si no hay sesión, verificar si estamos en un flujo de recuperación
          const urlParams = new URLSearchParams(window.location.search);
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Establecer la sesión con los tokens de la URL
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              setError('Sesión inválida o expirada. Por favor, solicita un nuevo enlace de recuperación.');
              setIsValidSession(false);
            } else {
              setIsValidSession(true);
            }
          } else {
            setError('No se encontró una sesión válida. Por favor, solicita un nuevo enlace de recuperación de contraseña.');
            setIsValidSession(false);
          }
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        setError('Error inesperado al verificar la sesión.');
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsValidSession(true);
          setError('');
        } else if (event === 'SIGNED_OUT') {
          setIsValidSession(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidSession) {
      setError('Sesión inválida. Por favor, solicita un nuevo enlace de recuperación.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        setError(error.message);
      } else {
        setMessage('¡Tu contraseña ha sido actualizada con éxito!');
        setPassword(''); // Limpiar el campo
        
        // Opcional: Redirigir después de un tiempo
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setError('Error inesperado al actualizar la contraseña.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner mientras verifica la sesión
  if (checkingSession) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión válida, mostrar mensaje de error con instrucciones
  if (!isValidSession) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sesión Requerida</h1>
          <p className="mt-2 text-red-600">
            No se encontró una sesión válida para actualizar la contraseña.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">¿Qué hacer?</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Asegúrate de hacer clic en el enlace enviado a tu correo</li>
            <li>• El enlace puede haber expirado - solicita uno nuevo</li>
            <li>• Verifica que estás usando el enlace completo</li>
          </ul>
        </div>
        <div className="space-y-3">
          <a 
            href="/forgot-password" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center block"
          >
            Solicitar Nuevo Enlace
          </a>
          <a 
            href="/login" 
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center block"
          >
            Volver al Login
          </a>
        </div>
      </div>
    );
  }

  // Formulario normal cuando hay sesión válida
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Crea una nueva contraseña</h1>
        <p className="mt-2 text-gray-600">Asegúrate de que sea segura y fácil de recordar.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Nueva Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 6 caracteres
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-center text-sm font-medium text-green-700">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-center text-sm font-medium text-red-700">{error}</p>
        </div>
      )}
      <div className="text-center">
        <a href="/login" className="font-semibold text-red-600 hover:text-red-500 text-sm">
          Ir a Iniciar Sesión
        </a>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;