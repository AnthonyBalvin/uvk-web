import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function EditMovieForm({ pelicula }) {
  const [formData, setFormData] = useState({
    titulo: pelicula.titulo || '',
    sinopsis: pelicula.sinopsis || '',
    duracion: pelicula.duracion || '',
    genero: pelicula.genero || '',
    imagen_url: pelicula.imagen_url || '',
    trailer_url: pelicula.trailer_url || '',
    estado: pelicula.estado || 'En cartelera',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('peliculas')
        .update({ ...formData, duracion: parseInt(formData.duracion) })
        .eq('id', pelicula.id);

      if (updateError) throw updateError;
      
      window.location.href = '/admin/peliculas?status=edited';

    } catch (err) {
      setError(`Error al guardar los cambios: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
            </svg>
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
                Título de la Película
              </label>
              <input
                type="text"
                name="titulo"
                id="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200"
                placeholder="Ej: Avatar: El Camino del Agua"
              />
            </div>

            <div>
              <label htmlFor="genero" className="block text-sm font-semibold text-gray-700 mb-2">
                Género
              </label>
              <input
                type="text"
                name="genero"
                id="genero"
                value={formData.genero}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200"
                placeholder="Ej: Acción, Aventura, Ciencia Ficción"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="sinopsis" className="block text-sm font-semibold text-gray-700 mb-2">
              Sinopsis
            </label>
            <textarea
              name="sinopsis"
              id="sinopsis"
              rows="5"
              value={formData.sinopsis}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200 resize-none"
              placeholder="Escribe una descripción atractiva de la película que enganche a los espectadores..."
            ></textarea>
          </div>
        </div>

        {/* Detalles y Estado */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Detalles y Estado
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duracion" className="block text-sm font-semibold text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <input
                type="number"
                name="duracion"
                id="duracion"
                value={formData.duracion}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200"
                placeholder="120"
                min="1"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                id="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="En cartelera">En cartelera</option>
                <option value="Próximo estreno">Próximo estreno</option>
              </select>
            </div>
          </div>
        </div>

        {/* Multimedia */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Contenido Multimedia
          </h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="imagen_url" className="block text-sm font-semibold text-gray-700 mb-2">
                URL del Póster
              </label>
              <input
                type="url"
                name="imagen_url"
                id="imagen_url"
                value={formData.imagen_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200"
                placeholder="https://ejemplo.com/poster.jpg"
              />
              <p className="mt-2 text-xs text-gray-500">Proporciona la URL de la imagen del póster de la película</p>
            </div>

            <div>
              <label htmlFor="trailer_url" className="block text-sm font-semibold text-gray-700 mb-2">
                URL del Tráiler (YouTube)
              </label>
              <input
                type="url"
                name="trailer_url"
                id="trailer_url"
                value={formData.trailer_url}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all duration-200"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="mt-2 text-xs text-gray-500">Link del tráiler oficial en YouTube</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="/admin/peliculas"
            className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-center"
          >
            Cancelar
          </a>
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-8 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}