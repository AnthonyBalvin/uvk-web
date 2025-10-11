import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- Interfaz de propiedades actualizada ---
interface PerfilDashboardProps {
  serverProfile: {
    id: string;
    nombre: string;
    apellido: string;
    created_at: string; // Necesitamos la fecha
  } | null;
  serverBoletos: any[];
  serverEmail: string; // Recibimos el email por separado
}

// --- Componente EntradaCard (tu versión, con colores ajustados) ---
const EntradaCard = ({ boleto }: { boleto: any }) => {
  const funcion = boleto.funcion;
  if (!funcion) return null;

  const pelicula = funcion.pelicula;
  const cine = funcion.cine;
  const sala = funcion.sala_info;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col md:flex-row transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
      <img 
        src={pelicula.imagen_url} 
        alt={`Póster de ${pelicula.titulo}`} 
        className="w-full h-48 md:h-auto md:w-40 object-cover"
      />
      <div className="p-6 flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{pelicula.titulo}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><p className="text-gray-500">Cine</p><p className="font-semibold text-gray-800">{cine.nombre}</p></div>
          <div><p className="text-gray-500">Sala</p><p className="font-semibold text-gray-800">{sala.nombre}</p></div>
          <div><p className="text-gray-500">Fecha y Hora</p><p className="font-semibold text-gray-800">{new Date(funcion.fecha_hora).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p></div>
          <div><p className="text-gray-500">Comprado el</p><p className="font-semibold text-gray-800">{new Date(boleto.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg flex items-center justify-center space-x-4 border-t-2 border-red-200">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          <div><p className="text-sm font-medium text-red-700">Asiento</p><p className="text-2xl font-bold text-red-600">{boleto.fila}{boleto.asiento}</p></div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal con los campos restaurados y colores correctos ---
const PerfilDashboard = ({ serverProfile, serverBoletos, serverEmail }: PerfilDashboardProps) => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [profile, setProfile] = useState(serverProfile);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: serverProfile?.nombre || '',
    apellido: serverProfile?.apellido || ''
  });

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const { data, error } = await supabase.from('perfiles').update({ nombre: formData.nombre, apellido: formData.apellido }).eq('id', profile.id).select().single();
      if (error) throw error;
      setProfile(data);
      setEditMode(false);
      alert('¡Perfil actualizado con éxito!');
    } catch (error: any) {
      alert(`Error al actualizar el perfil: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8"><h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Perfil</h1><p className="text-gray-600">Gestiona tu información personal y revisa tu historial</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 text-center border-b border-gray-100">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>{profile?.nombre?.charAt(0)?.toUpperCase() || 'U'}</div>
                <h3 className="text-xl font-semibold text-gray-800">{profile?.nombre} {profile?.apellido}</h3>
                <p className="text-gray-500 text-sm">{serverEmail}</p>
                <div className="mt-4 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(229, 9, 20, 0.1)', color: '#e50914' }}>Cliente VIP</div>
              </div>
              <div className="p-2">
                <button onClick={() => setActiveTab('perfil')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'perfil' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Datos Personales</button>
                <button onClick={() => setActiveTab('compras')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'compras' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Mis Compras</button>
                <button onClick={() => setActiveTab('entradas')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'entradas' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Mis Entradas</button>
                <button onClick={() => setActiveTab('favoritos')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'favoritos' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Favoritos</button>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {activeTab === 'perfil' && (
                <div>
                  <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2><button onClick={() => setEditMode(!editMode)} className="px-6 py-2 rounded-lg font-medium transition-all duration-200" style={{ background: editMode ? '#f3f4f6' : 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)', color: editMode ? '#374151' : 'white' }}>{editMode ? 'Cancelar' : 'Editar'}</button></div>
                  {editMode ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label><input type="text" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg"/></div>
                      </div>
                      <div className="flex justify-end"><button type="submit" className="px-6 py-3 rounded-lg font-medium text-white" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>Guardar Cambios</button></div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg"><label className="text-sm font-medium text-gray-500">Nombre Completo</label><p className="text-lg text-gray-800 mt-1">{profile?.nombre} {profile?.apellido}</p></div>
                        <div className="bg-gray-50 p-4 rounded-lg"><label className="text-sm font-medium text-gray-500">Email</label><p className="text-lg text-gray-800 mt-1">{serverEmail}</p></div>
                      </div>
                      {profile?.created_at && (
                         <div className="bg-gray-50 p-4 rounded-lg mt-6"><label className="text-sm font-medium text-gray-500">Miembro desde</label><p className="text-lg text-gray-800 mt-1">{new Date(profile.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'entradas' && (<div><h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Entradas</h2>{serverBoletos.length > 0 ? (<div className="space-y-6">{serverBoletos.map(boleto => (<EntradaCard key={boleto.id} boleto={boleto} />))}</div>) : (<div className="text-center py-12"><p className="text-gray-500">Aún no has comprado ninguna entrada.</p></div>)}</div>)}
              {activeTab === 'compras' && (<div><h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Compras</h2><div className="text-center py-12"><p className="text-gray-500">Sección en desarrollo.</p></div></div>)}
              {activeTab === 'favoritos' && (<div><h2 className="text-2xl font-bold text-gray-800 mb-6">Favoritos</h2><div className="text-center py-12"><p className="text-gray-500">Sección en desarrollo.</p></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilDashboard;