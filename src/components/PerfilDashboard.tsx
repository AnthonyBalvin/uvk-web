import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { fetchFavoriteMovies, toggleFavorite } from '../lib/favoritesService.js';

// --- Interfaz de propiedades actualizada ---
interface PerfilDashboardProps {
  serverProfile: {
    id: string;
    nombre: string;
    apellido: string;
    created_at: string;
  } | null;
  serverBoletos: any[];
  serverEmail: string;
}

// --- Componente EntradaCard (con funcionalidad de PDF) ---
const EntradaCard = ({ boleto }: { boleto: any }) => {
  const funcion = boleto.funcion;
  if (!funcion) return null;

  const pelicula = funcion.pelicula;
  const cine = funcion.cine;
  const sala = funcion.sala_info;

  // Función para generar el PDF de la entrada
  const generateTicketPDF = async () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      const uvkRed: [number, number, number] = [229, 9, 20];
      const darkGray: [number, number, number] = [31, 41, 55];
      const lightGray: [number, number, number] = [156, 163, 175];

      pdf.setFillColor(...uvkRed);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('UVK CINES', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('ENTRADA DE CINE', pageWidth / 2, 30, { align: 'center' });

      pdf.setDrawColor(...uvkRed);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 45, pageWidth - margin, 45);

      let yPos = 55;
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(pelicula.titulo, contentWidth);
      pdf.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
      yPos += titleLines.length * 8 + 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const funcionDate = new Date(funcion.fecha_hora);
      const dateStr = funcionDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      const timeStr = funcionDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');

      pdf.setTextColor(...lightGray);
      pdf.setFontSize(9);
      yPos += 8;
      pdf.text('CINE', margin + 5, yPos);
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cine.nombre, margin + 5, yPos + 5);

      pdf.setTextColor(...lightGray);
      pdf.setFontSize(9);
      pdf.text('SALA', margin + 5, yPos + 13);
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sala.nombre, margin + 5, yPos + 18);

      pdf.setTextColor(...lightGray);
      pdf.setFontSize(9);
      pdf.text('FECHA', margin + 5, yPos + 26);
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const dateLines = pdf.splitTextToSize(dateStr, contentWidth - 10);
      pdf.text(dateLines, margin + 5, yPos + 31);

      pdf.setTextColor(...lightGray);
      pdf.setFontSize(9);
      pdf.text('HORA', margin + 5, yPos + 39);
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(timeStr, margin + 5, yPos + 44);

      yPos += 60;
      pdf.setFillColor(...uvkRed);
      pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('ASIENTO', pageWidth / 2, yPos + 10, { align: 'center' });
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${boleto.fila}${boleto.asiento}`, pageWidth / 2, yPos + 22, { align: 'center' });

      yPos += 40;
      pdf.setTextColor(...lightGray);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const compraDate = new Date(boleto.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
      pdf.text(`Comprado el: ${compraDate}`, margin, yPos);
      pdf.text(`ID Boleto: ${boleto.id}`, margin, yPos + 5);

      yPos += 15;
      const qrData = JSON.stringify({ id: boleto.id, funcion_id: funcion.id, asiento: `${boleto.fila}${boleto.asiento}`, fecha: funcion.fecha_hora });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 400, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } });
      const qrSize = 60;
      const qrX = (pageWidth - qrSize) / 2;
      pdf.addImage(qrCodeDataUrl, 'PNG', qrX, yPos, qrSize, qrSize);
      yPos += qrSize + 10;
      pdf.setTextColor(...lightGray);
      pdf.setFontSize(8);
      pdf.text('Presenta este código QR en la entrada del cine', pageWidth / 2, yPos, { align: 'center' });

      yPos = pdf.internal.pageSize.getHeight() - 20;
      pdf.setDrawColor(...lightGray);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      pdf.setTextColor(...lightGray);
      pdf.setFontSize(7);
      pdf.text('UVK Cines - Disfruta la mejor experiencia cinematográfica', pageWidth / 2, yPos + 5, { align: 'center' });
      pdf.text('www.uvkcines.com', pageWidth / 2, yPos + 9, { align: 'center' });

      const fileName = `UVK_Entrada_${pelicula.titulo.replace(/[^a-z0-9]/gi, '_')}_${boleto.fila}${boleto.asiento}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex flex-col md:flex-row transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
      <img src={pelicula.imagen_url} alt={`Póster de ${pelicula.titulo}`} className="w-full h-48 md:h-auto md:w-40 object-cover" />
      <div className="p-6 flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{pelicula.titulo}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><p className="text-gray-500">Cine</p><p className="font-semibold text-gray-800">{cine.nombre}</p></div>
          <div><p className="text-gray-500">Sala</p><p className="font-semibold text-gray-800">{sala.nombre}</p></div>
          <div><p className="text-gray-500">Fecha y Hora</p><p className="font-semibold text-gray-800">{new Date(funcion.fecha_hora).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p></div>
          <div><p className="text-gray-500">Comprado el</p><p className="font-semibold text-gray-800">{new Date(boleto.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between border-t-2 border-red-200">
          <div className="flex items-center space-x-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            <div><p className="text-sm font-medium text-red-700">Asiento</p><p className="text-2xl font-bold text-red-600">{boleto.fila}{boleto.asiento}</p></div>
          </div>
          <button onClick={generateTicketPDF} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg" title="Descargar entrada en PDF">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
const PerfilDashboard = ({ serverProfile, serverBoletos, serverEmail }: PerfilDashboardProps) => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [profile, setProfile] = useState(serverProfile);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ nombre: serverProfile?.nombre || '', apellido: serverProfile?.apellido || '' });
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error'; visible: boolean }>({ message: '', type: 'info', visible: false });

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  useEffect(() => {
    (async () => {
      const movies = await fetchFavoriteMovies();
      setFavoriteMovies(movies || []);
    })();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .update({ nombre: formData.nombre, apellido: formData.apellido })
        .eq('id', profile.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      setEditMode(false);
      showToast('¡Perfil actualizado con éxito!', 'success');
    } catch (error: any) {
      showToast(`Error al actualizar el perfil: ${error.message}`, 'error');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y revisa tu historial</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                <button onClick={() => setActiveTab('entradas')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'entradas' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Mis Entradas</button>
                <button onClick={() => setActiveTab('favoritos')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === 'favoritos' ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Favoritos</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {activeTab === 'perfil' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2>
                    <button onClick={() => setEditMode(!editMode)} className="px-6 py-2 rounded-lg font-medium transition-all duration-200" style={{ background: editMode ? '#f3f4f6' : 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)', color: editMode ? '#374151' : 'white' }}>{editMode ? 'Cancelar' : 'Editar'}</button>
                  </div>
                  {editMode ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                          <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                          <input type="text" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="px-6 py-3 rounded-lg font-medium text-white" style={{ background: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)' }}>Guardar Cambios</button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                          <p className="text-lg text-gray-800 mt-1">{profile?.nombre} {profile?.apellido}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-lg text-gray-800 mt-1">{serverEmail}</p>
                        </div>
                      </div>
                      {profile?.created_at && (
                        <div className="bg-gray-50 p-4 rounded-lg mt-6">
                          <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                          <p className="text-lg text-gray-800 mt-1">{new Date(profile.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'entradas' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Entradas</h2>
                  {serverBoletos.length > 0 ? (
                    <div className="space-y-6">
                      {serverBoletos.map(boleto => (<EntradaCard key={boleto.id} boleto={boleto} />))}
                    </div>
                  ) : (
                    <div className="text-center py-12"><p className="text-gray-500">Aún no has comprado ninguna entrada.</p></div>
                  )}
                </div>
              )}

              {activeTab === 'favoritos' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Favoritos</h2>
                  {favoriteMovies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteMovies.map((pelicula: any) => (
                        <a key={pelicula.id} href={`/${pelicula.id}`} className="block group">
                          <div className="rounded-xl overflow-hidden border border-gray-200 shadow hover:shadow-lg transition-all duration-300 relative">
                            <div className={`absolute top-3 right-3 z-10`}>
                              <button
                                aria-label="Quitar de favoritos"
                                title="Quitar de favoritos"
                                className="p-2 rounded-full bg-white/90 hover:bg-white shadow ring-2 ring-red-500"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Optimista: quitar de la lista
                                  const prev = favoriteMovies;
                                  setFavoriteMovies(prev.filter((p: any) => p.id !== pelicula.id));
                                  try {
                                    await toggleFavorite(pelicula.id);
                                    showToast('Quitado de favoritos', 'success');
                                  } catch (err: any) {
                                    // Revertir si falla
                                    setFavoriteMovies(prev);
                                    const msg = err?.message || 'Error al quitar de favoritos.';
                                    showToast(msg, 'error');
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e50914" stroke="#e50914" strokeWidth="2" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C4.099 3.75 2 5.765 2 8.25c0 7.22 9.188 12 9.188 12S21 15.47 21 8.25z" />
                                </svg>
                              </button>
                            </div>
                            <div className="aspect-[3/4] overflow-hidden">
                              <img src={pelicula.imagen_url || '/images/placeholder.jpg'} alt={`Carátula de ${pelicula.titulo}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div className="p-4 bg-white">
                              <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors">{pelicula.titulo}</h3>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{pelicula.genero}</p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Aún no has agregado películas a favoritos.</p>
                    </div>
                  )}
                </div>
              )}
              {toast.visible && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-opacity ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                  {toast.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilDashboard;