// src/components/ClientesTable.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- NUEVO: Componente para las Notificaciones Toast ---
const Toast = ({ message, type, onHide }) => {
  useEffect(() => {
    // Ocultar la notificación después de 3 segundos
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  return (
    <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      {message}
    </div>
  );
};

// Componente Modal (sin cambios)
const Modal = ({ children, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <button onClick={onClose} className="modal-close-button">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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

  // --- NUEVO: Estados para animaciones y notificaciones ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // --- NUEVO: Función para mostrar notificaciones ---
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    // Usamos un timeout para que la animación de salida se active después
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

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

  // --- ACTUALIZADO: Función de actualizar con animaciones ---
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

      showToast('Cliente actualizado con éxito.', 'success');
      setEditModalOpen(false);
      fetchClientes();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ACTUALIZADO: Función de eliminar con animaciones ---
  const handleDeleteClient = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('perfiles')
        .delete()
        .eq('id', selectedClient.id);
      
      if (error) throw error;

      showToast('Cliente eliminado correctamente.', 'success');
      setDeleteModalOpen(false);
      fetchClientes();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-medium)' }}>Cargando clientes...</p>;
  if (error) return <p style={{ color: 'var(--primary-red)' }}>Error al cargar: {error}</p>;

  return (
    <>
      {/* --- NUEVO: Renderiza el toast si está activo --- */}
      <div className="toast-container">
        {toast.show && <Toast message={toast.message} type={toast.type} onHide={() => setToast({ show: false, message: '', type: '' })} />}
      </div>
      
      {/* El resto del código de la tabla no cambia */}
      <div style={{ overflowX: 'auto' }}>
        <table className="content-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Rol</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nombre || 'N/A'}</td>
                <td>{cliente.apellido || 'N/A'}</td>
                <td>
                  <span className={`rol-badge ${cliente.rol === 'administrador' ? 'administrador' : 'cliente'}`}>
                    {cliente.rol}
                  </span>
                </td>
                <td className="acciones-cell">
                  <button onClick={() => handleEditClick(cliente)} title="Editar" disabled={isSubmitting}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDeleteClick(cliente)} title="Eliminar" disabled={isSubmitting}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE EDICIÓN CON BOTONES ACTUALIZADOS --- */}
      {isEditModalOpen && (
        <Modal onClose={() => !isSubmitting && setEditModalOpen(false)}>
          <h2>Editar Perfil</h2>
          <form onSubmit={handleUpdateClient} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <input type="text" id="nombre" defaultValue={selectedClient.nombre} className="form-input" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="apellido" className="form-label">Apellido</label>
              <input type="text" id="apellido" defaultValue={selectedClient.apellido} className="form-input" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="rol" className="form-label">Rol</label>
              <select id="rol" defaultValue={selectedClient.rol} className="form-input" disabled={isSubmitting}>
                <option value="cliente">Cliente</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <div className="spinner"></div> : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- MODAL DE ELIMINACIÓN CON BOTONES ACTUALIZADOS --- */}
      {isDeleteModalOpen && (
        <Modal onClose={() => !isSubmitting && setDeleteModalOpen(false)}>
          <h2>Confirmar Eliminación</h2>
          <p>¿Estás seguro de que quieres eliminar a <strong>{selectedClient.nombre || 'el usuario'} {selectedClient.apellido || ''}</strong>?</p>
          <div className="modal-actions">
            <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
            <button onClick={handleDeleteClient} className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <div className="spinner"></div> : 'Sí, Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ClientesTable;