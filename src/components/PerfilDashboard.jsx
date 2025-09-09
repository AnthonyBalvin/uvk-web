// src/components/PerfilDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- NUEVO: Componente para la notificación (Toast) con fondo blanco ---
const Toast = ({ message, type, onHide }) => {
  // Estado para controlar la clase de animación (para la entrada y salida suave)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar el toast con un pequeño retraso para la animación de entrada
    const showTimer = setTimeout(() => setIsVisible(true), 10); 
    
    // Ocultar el toast automáticamente después de 3 segundos
    const hideTimer = setTimeout(() => {
      setIsVisible(false); // Inicia la animación de salida
      // Después de que la animación de salida termine, desmontar el componente
      setTimeout(onHide, 300); // 300ms es la duración de la transición
    }, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onHide]);

  // Estilos base para la notificación
  const baseStyle = "fixed top-24 right-8 p-4 pr-6 rounded-lg shadow-xl transition-all transform duration-300 ease-out z-1000 overflow-hidden";
  
  // Estilos para la "esquina" de color
  const cornerStyle = type === 'success' 
    ? 'bg-green-500' 
    : 'bg-red-600';
  
  // Fondo principal ahora es blanco
  const mainBackgroundColor = 'bg-white'; 
  
  // Texto oscuro para contraste sobre el fondo blanco
  const textColor = 'text-gray-800'; 

  return (
    <div 
      className={`${baseStyle} ${mainBackgroundColor} ${textColor} ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ zIndex: 1000 }} // Aseguramos que siempre esté arriba
    >
      {/* La "esquina" de color con un poco de padding a la izquierda para el mensaje */}
      <div 
        className={`absolute top-0 left-0 h-full w-2 rounded-l-lg ${cornerStyle}`}
      ></div>
      <span className="ml-2">
        {message}
      </span>
    </div>
  );
};


const PerfilDashboard = () => {
  // Tus estados originales (sin cambios)
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [compras, setCompras] = useState([]);
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // --- NUEVO: Estado para manejar la notificación ---
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  // Tu función para obtener datos (sin cambios)
  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setUser(session.user);
      const { data: profileData } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);
      setFormData(profileData || {});
      const { data: comprasData } = await supabase.from('compras').select(`*, entradas:entradas(*), productos:productos(*)`)
        .eq('usuario_id', session.user.id)
        .order('fecha_compra', { ascending: false });
      setCompras(comprasData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN ACTUALIZADA: Usa la notificación en lugar de alert() ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
      };
      const { data, error } = await supabase.from('perfiles').update(updateData).eq('id', user.id).select().single();
      if (error) throw error;
      setProfile(data);
      setEditMode(false);
      // Mostramos la notificación de éxito
      setToast({ show: true, message: 'Perfil actualizado correctamente', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      // Mostramos la notificación de error
      setToast({ show: true, message: 'Error al actualizar el perfil', type: 'error' });
    }
  };
  
  // Tus funciones de formato (sin cambios)
  const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Tu JSX de carga (sin cambios)
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8"><div className="max-w-6xl mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded mb-6 w-48"></div><div className="grid grid-cols-1 lg:grid-cols-4 gap-8"><div className="lg:col-span-1"><div className="bg-white rounded-2xl p-6 shadow-lg"><div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div><div className="h-6 bg-gray-200 rounded mb-2"></div><div className="h-4 bg-gray-200 rounded"></div></div></div><div className="lg:col-span-3"><div className="bg-white rounded-2xl p-6 shadow-lg"><div className="h-64 bg-gray-200 rounded"></div></div></div></div></div></div></div>
    );
  }

  // Tu JSX principal
  return (
    <div className="container mx-auto px-6 py-8">
      {/* --- NUEVO: Aquí se renderiza la notificación si está activa --- */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onHide={() => setToast({ show: false, message: '', type: '' })} 
        />
      )}

      {/* El resto de tu código HTML/JSX no necesita ningún cambio */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y revisa tu historial</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 text-center border-b border-gray-100">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>
                  {profile?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{profile?.nombre} {profile?.apellido}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <div className="mt-4 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(229, 9, 20, 0.1)', color: '#e50914' }}>Cliente VIP</div>
              </div>
              <div className="p-2">
                <button onClick={() => setActiveTab('perfil')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'perfil' ? 'bg-red-50 text-red-600 font-medium border-l-4 border-red-500' : 'text-gray-700 hover:bg-gray-50'}`}><span className="flex items-center"><svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Datos Personales</span></button>
                <button onClick={() => setActiveTab('compras')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'compras' ? 'bg-red-50 text-red-600 font-medium border-l-4 border-red-500' : 'text-gray-700 hover:bg-gray-50'}`}><span className="flex items-center"><svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" /></svg>Mis Compras</span></button>
                <button onClick={() => setActiveTab('entradas')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'entradas' ? 'bg-red-50 text-red-600 font-medium border-l-4 border-red-500' : 'text-gray-700 hover:bg-gray-50'}`}><span className="flex items-center"><svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>Mis Entradas</span></button>
                <button onClick={() => setActiveTab('favoritos')} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'favoritos' ? 'bg-red-50 text-red-600 font-medium border-l-4 border-red-500' : 'text-gray-700 hover:bg-gray-50'}`}><span className="flex items-center"><svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>Favoritos</span></button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg">
              {activeTab === 'perfil' && ( <div className="p-8"> <div className="flex justify-between items-center mb-6"> <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2> <button onClick={() => setEditMode(!editMode)} className="px-6 py-2 rounded-lg font-medium transition-all duration-200" style={{ background: editMode ? '#f3f4f6' : 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)', color: editMode ? '#374151' : 'white' }}>{editMode ? 'Cancelar' : 'Editar'}</button> </div> {editMode ? ( <form onSubmit={handleUpdateProfile} className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label> <input type="text" value={formData.nombre || ''} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"/> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label> <input type="text" value={formData.apellido || ''} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"/> </div> </div> <div className="flex justify-end space-x-4"> <button type="button" onClick={() => setEditMode(false)} className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancelar</button> <button type="submit" className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-200" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>Guardar Cambios</button> </div> </form> ) : ( <div className="space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="bg-gray-50 p-4 rounded-lg"><label className="text-sm font-medium text-gray-500">Nombre Completa</label><p className="text-lg text-gray-800 mt-1">{profile?.nombre} {profile?.apellido}</p></div> <div className="bg-gray-50 p-4 rounded-lg"><label className="text-sm font-medium text-gray-500">Email</label><p className="text-lg text-gray-800 mt-1">{user?.email}</p></div> </div> <div className="bg-gray-50 p-4 rounded-lg"><label className="text-sm font-medium text-gray-500">Miembro desde</label><p className="text-lg text-gray-800 mt-1">{new Date(user?.created_at).toLocaleDateString('es-PE')}</p></div> </div> )} </div> )}
              {activeTab === 'compras' && ( <div className="p-8"> <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Compras</h2> {compras.length === 0 ? ( <div className="text-center py-12"><svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" /></svg><h3 className="text-xl font-medium text-gray-500 mb-2">No tienes compras aún</h3><p className="text-gray-400">Cuando realices tu primera compra, aparecerá aquí</p><a href="/" className="inline-block mt-6 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>Ver Cartelera</a></div> ) : ( <div className="space-y-4"> {compras.map((compra) => ( <div key={compra.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"> <div className="flex justify-between items-start mb-4"> <div><h3 className="font-semibold text-lg text-gray-800">Compra #{compra.id}</h3><p className="text-gray-500">{formatDate(compra.fecha_compra)}</p></div> <div className="text-right"><p className="text-2xl font-bold text-red-600">{formatCurrency(compra.total)}</p><span className={`px-3 py-1 rounded-full text-sm font-medium ${compra.estado === 'completada' ? 'bg-green-100 text-green-800' : compra.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{compra.estado}</span></div> </div> <div className="space-y-2"> {compra.entradas?.map((entrada) => (<div key={entrada.id} className="flex justify-between items-center py-2 border-t"><span>{entrada.pelicula} - {entrada.asiento}</span><span className="font-medium">{formatCurrency(entrada.precio)}</span></div>))} {compra.productos?.map((producto) => (<div key={producto.id} className="flex justify-between items-center py-2 border-t"><span>{producto.nombre} x{producto.cantidad}</span><span className="font-medium">{formatCurrency(producto.precio * producto.cantidad)}</span></div>))} </div> </div> ))} </div> )} </div> )}
              {(activeTab === 'entradas' || activeTab === 'favoritos') && ( <div className="p-8"><h2 className="text-2xl font-bold text-gray-800 mb-6">{activeTab === 'entradas' ? 'Mis Entradas' : 'Mis Favoritos'}</h2><div className="text-center py-12"><p className="text-gray-500">Sección en desarrollo</p></div></div> )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilDashboard;