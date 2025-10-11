import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Componente Toast mejorado
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

// Modal de confirmación mejorado
const DeleteModal = ({ movieTitle, onCancel, onConfirm, isDeleting }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4" 
    style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.25)', 
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    }}
  >
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Confirmar Eliminación</h3>
      <p className="text-gray-600 text-center mb-6">
        ¿Estás seguro de que quieres eliminar la película <strong className="text-gray-900">"{movieTitle}"</strong>? Esta acción no se puede deshacer.
      </p>
      
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all disabled:from-gray-400 disabled:to-gray-500 shadow-lg flex items-center justify-center"
        >
          {isDeleting ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Sí, Eliminar'}
        </button>
      </div>
    </div>
  </div>
);

export default function MoviesTable({ initialMovies, status }) {
  const [movies, setMovies] = useState(initialMovies);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (status === 'edited') {
      setToast({ show: true, message: 'Película actualizada con éxito', type: 'success' });
    }
  }, [status]);

  const handleDelete = async (movieId) => {
    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase.from('peliculas').delete().eq('id', movieId);
      if (deleteError) throw deleteError;
      
      setMovies(movies.filter(movie => movie.id !== movieId));
      setConfirmDelete(null);
      setToast({ show: true, message: 'Película eliminada con éxito', type: 'success' });

    } catch (err) {
      setError(`Error al eliminar la película: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} onHide={() => setToast({ show: false, message: '', type: '' })} />}
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 m-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Película</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Género</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duración</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movies.length > 0 ? movies.map(movie => (
                <tr key={movie.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-20 w-14 rounded-lg overflow-hidden shadow-md">
                        <img 
                          className="h-full w-full object-cover" 
                          src={movie.imagen_url} 
                          alt={movie.titulo}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/56x80?text=No+Image';
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{movie.titulo}</div>
                        <div className="text-xs text-gray-500 mt-1">{movie.duracion} minutos</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{movie.genero}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{movie.duracion} min</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      movie.estado === 'En cartelera' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {movie.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`/admin/peliculas/editar/${movie.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Editar película"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button 
                        onClick={() => setConfirmDelete(movie.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar película"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">No hay películas registradas</p>
                    <p className="text-gray-400 text-sm mt-2">Comienza agregando una nueva película</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <DeleteModal 
          movieTitle={movies.find(m => m.id === confirmDelete)?.titulo}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}