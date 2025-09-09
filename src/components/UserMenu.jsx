// src/components/UserMenu.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserMenu = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true); // <--- NUEVO ESTADO

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
      setLoading(false); // <--- Marcamos como finalizada la carga inicial
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // --- NUEVA LÓGICA DE RENDERIZADO ---
  // Si está cargando, muestra un placeholder elegante.
  if (loading) {
    return (
      <div className="flex items-center space-x-3 h-[48px]"> {/* Altura fija para evitar saltos */}
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Si no está cargando y no hay usuario, muestra el botón.
  if (!user) {
    return (
      <a href="/login" className="text-white py-3 px-8 rounded-full font-semibold transition-all duration-300 shadow-xl text-lg" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>
        Iniciar Sesión
      </a>
    );
  }

  // Si no está cargando y sí hay usuario, muestra el menú.
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-3 text-lg font-semibold"
        style={{ color: '#2c2c2c' }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 border-2 border-red-500">
          <span className="font-bold text-red-600">
            {user.nombre ? user.nombre.charAt(0).toUpperCase() : ''}
          </span>
        </div>
        <span>{user.nombre} {user.apellido}</span>
        <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-2xl py-2 z-50">
          <a href="/perfil" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 text-base">Mi Perfil</a>
          <a href="/compras" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 text-base">Mis Compras</a>
          <div className="border-t my-2"></div>
          <button 
            onClick={handleLogout} 
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-semibold text-base"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;