import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserMenu = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('perfiles')
          .select('nombre, apellido')
          .eq('id', session.user.id)
          .single();
        setUser({ ...session.user, ...profile });
      }
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3 h-[48px]">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse shadow-lg"></div>
        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <a 
          href="/registro" 
          className="text-gray-700 hover:text-red-600 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-50"
        >
          Registrarse
        </a>
        <a 
          href="/login" 
          className="text-white py-3 px-8 rounded-full font-semibold transition-all duration-300 shadow-xl text-lg hover:shadow-2xl transform hover:scale-105" 
          style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-3 text-lg font-semibold bg-white bg-opacity-70 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group"
        style={{ color: '#2c2c2c' }}
      >
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}
        >
          {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold">{user.nombre} {user.apellido}</span>
          <span className="text-xs text-gray-500">Cliente VIP</span>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay para dispositivos móviles */}
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header del menú */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}
                >
                  {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{user.nombre} {user.apellido}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span 
                    className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(229, 9, 20, 0.1)', color: '#e50914' }}
                  >
                    Cliente VIP
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <a 
                href="/perfil" 
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Mi Perfil</p>
                  <p className="text-sm text-gray-500">Gestiona tu información personal</p>
                </div>
              </a>

              {/* Divider */}
              <div className="mx-6 my-2 border-t border-gray-100"></div>

              {/* Logout */}
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Cerrar Sesión</p>
                  <p className="text-sm text-red-400">Salir de tu cuenta</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;