import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Componente Toast mejorado con Tailwind
const Toast = ({ message, type, onHide }) => {
  useEffect(() => {
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 animate-fade-in ${
      type === 'success' 
        ? 'bg-green-50 border-l-4 border-green-500' 
        : 'bg-red-50 border-l-4 border-red-500'
    }`}>
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        )}
        <p className={`font-semibold ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

const Modal = ({ children, onClose, isSubmitting }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4" 
    style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.25)', 
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    }}
  >
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in relative">
      <button 
        onClick={onClose} 
        disabled={isSubmitting}
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {children}
    </div>
  </div>
);

const ClientesTable = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  // ENDPOINT 1: GET
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('perfiles').select('*');
      if (error) throw error;
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  // ENDPOINT 2: PUT
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { nombre, apellido, rol } = e.target.elements;
    
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ nombre: nombre.value, apellido: apellido.value, rol: rol.value })
        .eq('id', selectedClient.id);

      if (error) throw error;

      showToast('Cliente actualizado con éxito', 'success');
      setEditModalOpen(false);
      fetchClientes();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ENDPOINT 3: DELETE

  const handleDeleteClient = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('perfiles')
        .delete()
        .eq('id', selectedClient.id);
      
      if (error) throw error;

      showToast('Cliente eliminado correctamente', 'success');
      setDeleteModalOpen(false);
      fetchClientes();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-800 font-medium">Error al cargar: {error}</p>
      </div>
    );
  }

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onHide={() => setToast({ show: false, message: '', type: '' })} />}
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Apellido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.nombre || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cliente.apellido || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      cliente.rol === 'administrador' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {cliente.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(cliente)} 
                        disabled={isSubmitting}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(cliente)} 
                        disabled={isSubmitting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <Modal onClose={() => !isSubmitting && setEditModalOpen(false)} isSubmitting={isSubmitting}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</h2>
            <form onSubmit={handleUpdateClient} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre
                </label>
                <input 
                  type="text" 
                  id="nombre" 
                  defaultValue={selectedClient.nombre} 
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido
                </label>
                <input 
                  type="text" 
                  id="apellido" 
                  defaultValue={selectedClient.apellido} 
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="rol" className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol
                </label>
                <select 
                  id="rol" 
                  defaultValue={selectedClient.rol} 
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all disabled:bg-gray-100 bg-white"
                >
                  <option value="cliente">Cliente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditModalOpen(false)} 
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:from-gray-400 disabled:to-gray-500 shadow-lg flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <Modal onClose={() => !isSubmitting && setDeleteModalOpen(false)} isSubmitting={isSubmitting}>
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Confirmar Eliminación</h2>
            <p className="text-gray-600 text-center mb-6">
              ¿Estás seguro de que quieres eliminar a <strong className="text-gray-900">{selectedClient.nombre || 'el usuario'} {selectedClient.apellido || ''}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)} 
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteClient} 
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:from-gray-400 disabled:to-gray-500 shadow-lg flex items-center justify-center"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ClientesTable;