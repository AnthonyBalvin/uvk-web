import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AdminToast = ({ message, type, onHide }) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed top-24 right-8 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right flex items-center gap-3`}>
      {type === 'success' ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const Modal = ({ children, onClose, isSubmitting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all animate-scale-in relative max-h-[90vh] overflow-y-auto">
      <button 
        onClick={onClose} 
        disabled={isSubmitting}
        className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {children}
    </div>
  </div>
);

const AlimentoForm = ({ alimento, onSave, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    nombre: alimento?.nombre || '',
    descripcion: alimento?.descripcion || '',
    precio: alimento?.precio || '',
    imagen_url: alimento?.imagen_url || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal onClose={onCancel} isSubmitting={isSubmitting}>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{alimento ? 'Editar' : 'Nuevo'} Producto</h2>
          <p className="text-gray-500 mt-1">Completa los datos del producto de confitería</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input 
              type="text" name="nombre" id="nombre" value={formData.nombre} 
              onChange={handleChange} required disabled={isSubmitting}
              placeholder="Ej: Combo Clásico"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea 
              name="descripcion" id="descripcion" value={formData.descripcion} 
              onChange={handleChange} rows="3" disabled={isSubmitting}
              placeholder="Breve descripción del producto..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100 resize-none"
            ></textarea>
          </div>

          <div>
            <label htmlFor="precio" className="block text-sm font-semibold text-gray-700 mb-2">
              Precio (S/) *
            </label>
            <input 
              type="number" name="precio" id="precio" value={formData.precio} 
              onChange={handleChange} required step="0.01" disabled={isSubmitting}
              placeholder="0.00"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="imagen_url" className="block text-sm font-semibold text-gray-700 mb-2">
              URL de la Imagen
            </label>
            <input 
              type="url" name="imagen_url" id="imagen_url" value={formData.imagen_url} 
              onChange={handleChange} disabled={isSubmitting}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100"
            />
            {formData.imagen_url && (
              <div className="mt-3">
                <img src={formData.imagen_url} alt="Preview" className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="button" onClick={onCancel} disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:from-gray-400 disabled:to-gray-500 shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} isSubmitting={isSubmitting}>
      <div className="p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">¿Eliminar Producto?</h3>
        <p className="text-gray-600 mb-6">
          Estás a punto de eliminar <strong className="text-gray-900">"{itemName}"</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:from-gray-400 disabled:to-gray-500 shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sí, Eliminar'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default function AlimentosManager() {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlimento, setEditingAlimento] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingAlimento, setDeletingAlimento] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAlimentos();
  }, []);

  const fetchAlimentos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('alimentos').select('*').order('nombre', { ascending: true });
    if (error) {
      showToast(`Error: ${error.message}`, 'error');
    } else {
      setAlimentos(data);
    }
    setLoading(false);
  };

  const showToast = (message, type) => {
    setToast({ message, type, show: true });
  };

  const hideToast = () => {
    setToast({ message: '', type: '', show: false });
  };

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    if (editingAlimento) {
      const { error } = await supabase.from('alimentos').update(formData).eq('id', editingAlimento.id);
      if (error) showToast(`Error: ${error.message}`, 'error');
      else showToast('Producto actualizado correctamente', 'success');
    } else {
      const { error } = await supabase.from('alimentos').insert([formData]);
      if (error) showToast(`Error: ${error.message}`, 'error');
      else showToast('Producto añadido correctamente', 'success');
    }
    
    setShowForm(false);
    setEditingAlimento(null);
    setIsSubmitting(false);
    fetchAlimentos();
  };

  const handleDelete = async () => {
    if (!deletingAlimento) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('alimentos').delete().eq('id', deletingAlimento.id);
    
    if (error) showToast(`Error: ${error.message}`, 'error');
    else showToast('Producto eliminado correctamente', 'success');

    setShowConfirmModal(false);
    setDeletingAlimento(null);
    setIsSubmitting(false);
    fetchAlimentos();
  };

  const openDeleteModal = (alimento) => {
    setDeletingAlimento(alimento);
    setShowConfirmModal(true);
  };

  const openForm = (alimento = null) => {
    setEditingAlimento(alimento);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {toast.show && <AdminToast message={toast.message} type={toast.type} onHide={hideToast} />}
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alimentos</h1>
              <p className="text-gray-500">Gestiona la confitería de tu cine</p>
            </div>
          </div>
          <button 
            onClick={() => openForm()} 
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Añadir Alimento
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alimento</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alimentos.map((alimento) => (
              <tr key={alimento.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {alimento.imagen_url ? (
                      <img 
                        src={alimento.imagen_url} 
                        alt={alimento.nombre}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="font-medium text-gray-900">{alimento.nombre}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 max-w-md truncate">
                    {alimento.descripcion || 'Sin descripción'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-base font-bold text-gray-900">S/ {Number(alimento.precio).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openForm(alimento)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => openDeleteModal(alimento)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AlimentoForm 
          alimento={editingAlimento} 
          onSave={handleSave} 
          onCancel={() => { setShowForm(false); setEditingAlimento(null); }} 
          isSubmitting={isSubmitting} 
        />
      )}
      
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        itemName={deletingAlimento?.nombre}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}