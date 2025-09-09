// src/components/LoginForm.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Intentar hacer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setMessage(`Error: ${authError.message}`);
        setLoading(false);
        return;
      }

      // Si el login es exitoso, obtener información del perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('perfiles') // Tu tabla se llama 'perfiles'
        .select('rol') // Solo necesitamos el campo 'rol'
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        // Si no existe perfil, podrías crear uno o manejar el error
        console.error('Error obteniendo perfil:', profileError);
        setMessage('Error: No se pudo obtener la información del usuario');
        setLoading(false);
        return;
      }

      // Guardar información del usuario en localStorage para uso posterior
      const userInfo = {
        id: authData.user.id,
        email: authData.user.email,
        rol: profileData.rol
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      // Mostrar mensaje de bienvenida personalizado
      const welcomeMessage = profileData.rol === 'administrador' 
        ? `¡Bienvenido Administrador!`
        : `¡Bienvenido de vuelta!`;
      
      setMessage(welcomeMessage);

      // Redireccionar según el rol después de 1.5 segundos
      setTimeout(() => {
        if (profileData.rol === 'administrador') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 1500);

    } catch (error) {
      console.error('Error inesperado:', error);
      setMessage('Error: Ocurrió un problema inesperado');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Bienvenida */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ 
          backgroundImage: `url('/images/fondologin.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-red-900/60 to-black/90"></div>
        
        {/* Formas decorativas */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-red-400/20 rounded-full blur-3xl animate-pulse animation-delay-2s"></div>
        <div className="absolute top-1/2 left-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse animation-delay-4s"></div>
        
        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          {/* Logo */}
          <div className="mb-8 flex items-center">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl mr-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-wide">UVK CINES</span>
          </div>
          
          {/* Título de bienvenida */}
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Página de
            <br />
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Bienvenida
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-md">
            Inicia sesión para continuar tu experiencia cinematográfica
          </p>
          
          {/* Decoración adicional */}
          <div className="flex space-x-2 mb-8">
            <div className="w-12 h-1 bg-red-500 rounded-full"></div>
            <div className="w-8 h-1 bg-red-400 rounded-full"></div>
            <div className="w-4 h-1 bg-red-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        
        {/* Logo móvil (solo visible en pantallas pequeñas) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-800">UVK CINES</span>
        </div>

        <div className="w-full max-w-md">
          {/* Encabezado del formulario */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Checkbox y enlace */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Recuérdame
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-red-600 hover:text-red-500 font-semibold">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón principal */}
            <button
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Mensaje de error/éxito */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.startsWith('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              } animate-fade-in`}>
                <div className="flex items-center">
                  {message.startsWith('Error') ? (
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Link de registro */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <a href="/registro" className="font-semibold text-red-600 hover:text-red-500 transition-colors">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </form>
          
        </div>
      </div>

      {/* Estilos CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          
          .animation-delay-2s {
            animation-delay: 2s;
          }
          
          .animation-delay-4s {
            animation-delay: 4s;
          }

          /* Fondo móvil para pantallas pequeñas */
          @media (max-width: 1023px) {
            .w-full:first-child {
              background-image: url('/images/fondologin.jpg');
              background-size: cover;
              background-position: center;
            }
            
            .w-full:first-child::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(135deg, rgba(0,0,0,0.7), rgba(185,28,28,0.3));
              z-index: -1;
            }
          }
        `
      }} />
    </div>
  );
};

export default LoginForm;