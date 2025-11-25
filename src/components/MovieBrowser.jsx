import React, { useState, useEffect } from 'react';
import FilterSidebar from './FilterSidebar.jsx';
import { fetchFavoriteIds, toggleFavorite } from '../lib/favoritesService.js';

// Componente para la cuadrícula de películas (sin cambios)
const MovieGrid = ({ movies, favoriteIds, onToggleFavorite }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {movies.length > 0 ? (
      movies.map((pelicula) => (
        <a href={`/${pelicula.id}`} key={pelicula.id} className="block group">
          <div className="rounded-xl overflow-hidden hover:transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-300 relative border-2 movie-card" style={{ backgroundColor: '#ffffff', borderColor: '#e5ddd0', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
            <div className="aspect-[3/4] overflow-hidden">
              <img src={pelicula.imagen_url || '/images/placeholder.jpg'} alt={`Carátula de ${pelicula.titulo}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-6" style={{ background: 'linear-gradient(to bottom, #ffffff, #fafafa)' }}>
              <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-red-500 transition-colors duration-300" style={{ color: '#2c2c2c' }}>{pelicula.titulo}</h2>
              <p className="text-sm font-medium" style={{ color: '#666666' }}>{pelicula.genero}, {pelicula.duracion}min, +{pelicula.clasificacion || '14'}.</p>
            </div>
            {(() => { const isFav = (favoriteIds || []).includes(pelicula.id); return (
              <div className={`absolute top-4 right-4 transition-opacity duration-300 ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                  aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  className={`p-2 rounded-full bg-white/80 hover:bg-white shadow ${isFav ? 'ring-2 ring-red-500' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite && onToggleFavorite(pelicula.id); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFav ? '#e50914' : 'none'} stroke="#e50914" strokeWidth="2" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C4.099 3.75 2 5.765 2 8.25c0 7.22 9.188 12 9.188 12S21 15.47 21 8.25z" />
                  </svg>
                </button>
              </div>
            ); })()}
          </div>
        </a>
      ))
    ) : (
      <div className="col-span-full text-center py-16">
        <p className="text-2xl font-medium" style={{ color: '#666666' }}>No hay películas para mostrar en esta sección.</p>
      </div>
    )}
  </div>
);

// --- COMPONENTE PRINCIPAL CON LOS ESTILOS FINALES CORREGIDOS ---
const MovieBrowser = ({ moviesEnCartelera, proximosEstrenos, shows, ciudades, cines }) => {
  const [activeTab, setActiveTab] = useState('cartelera');
  const [filters, setFilters] = useState({ city: '', cinema: '', genre: '', day: '' });
  const [filteredMovies, setFilteredMovies] = useState(moviesEnCartelera || []);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  // Lógica de filtros (sin cambios)
  useEffect(() => {
    if (activeTab !== 'cartelera') {
      setFilteredMovies([]);
      return;
    }
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    if (!hasActiveFilters) {
      setFilteredMovies(moviesEnCartelera || []);
      return;
    }
    const matchingMovies = new Map();
    for (const show of shows) {
      if (!show.pelicula) continue;
      const passesGenre = !filters.genre || show.pelicula.genero.toLowerCase().includes(filters.genre.toLowerCase());
      const passesCity = !filters.city || (show.cine && show.cine.ciudad && show.cine.ciudad.nombre === filters.city);
      const passesCinema = !filters.cinema || (show.cine && show.cine.nombre === filters.cinema);
      const passesDay = !filters.day || show.fecha_hora.startsWith(filters.day);
      if (passesGenre && passesCity && passesCinema && passesDay) {
        if (!matchingMovies.has(show.pelicula.id)) {
          matchingMovies.set(show.pelicula.id, show.pelicula);
        }
      }
    }
    setFilteredMovies(Array.from(matchingMovies.values()));
  }, [filters, shows, moviesEnCartelera, activeTab]);

  // Cargar favoritos del usuario
  useEffect(() => {
    let mounted = true;
    (async () => {
      const ids = await fetchFavoriteIds();
      if (mounted) setFavoriteIds(ids || []);
    })();
    return () => { mounted = false; };
  }, []);

  const handleToggleFavorite = async (peliculaId) => {
    // Optimistic UI
    setFavoriteIds(prev => prev.includes(peliculaId) ? prev.filter(id => id !== peliculaId) : [...prev, peliculaId]);
    try {
      const res = await toggleFavorite(peliculaId);
      if (res && typeof res.favored === 'boolean') {
        setFavoriteIds(prev => res.favored ? (prev.includes(peliculaId) ? prev : [...prev, peliculaId]) : prev.filter(id => id !== peliculaId));
        showToast(res.favored ? 'Agregado a favoritos' : 'Quitado de favoritos', 'success');
      }
    } catch (e) {
      // Revert on error
      setFavoriteIds(prev => prev.includes(peliculaId) ? prev.filter(id => id !== peliculaId) : [...prev, peliculaId]);
      const msg = (e && e.message) ? e.message : 'Error al guardar favorito.';
      if (msg.toLowerCase().includes('no autenticado') || msg.toLowerCase().includes('auth')) {
        showToast('Debes iniciar sesión para usar favoritos.', 'error');
      } else {
        showToast(msg, 'error');
      }
    }
  };

  const moviesToShow = activeTab === 'cartelera' ? filteredMovies : proximosEstrenos;

  return (
    // Fragmento de React (<>) para no añadir divs extra
    <>
      {/* SECCIÓN DEL TÍTULO Y PESTAÑAS - Perfectamente alineado */}
      <div className="border-b pb-8 mb-8" style={{ borderBottom: '1px solid #333333' }}>
        <div className="container mx-auto px-8">
          {/* Usamos items-end para alinear la línea roja con el pie de "Películas" */}
          <div className="flex items-end py-8">
            <h1 className="text-5xl font-bold mr-12" style={{ color: '#e50914', textShadow: '2px 2px 4px rgba(229, 9, 20, 0.1)' }}>Películas</h1>
            <nav className="flex space-x-12">
              <button
                onClick={() => setActiveTab('cartelera')}
                className={`text-xl pb-2 transition-all duration-300 ${activeTab === 'cartelera' ? 'font-bold border-b-2' : 'font-semibold text-gray-500 hover:text-red-600'}`}
                style={activeTab === 'cartelera' ? { color: '#e50914', borderColor: '#e50914' } : { borderColor: 'transparent' }}
              >
                En cartelera
              </button>
              <button
                onClick={() => setActiveTab('estrenos')}
                className={`text-xl pb-2 transition-all duration-300 ${activeTab === 'estrenos' ? 'font-bold border-b-2' : 'font-semibold text-gray-500 hover:text-red-600'}`}
                style={activeTab === 'estrenos' ? { color: '#e50914', borderColor: '#e50914' } : { borderColor: 'transparent' }}
              >
                Próximos estrenos
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE FILTROS Y PELÍCULAS - Con más espacio después de la línea negra */}
      <div className="flex px-8 mt-12">
        <aside className={`w-80 flex-shrink-0 transition-opacity duration-300 ${activeTab !== 'cartelera' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <FilterSidebar ciudades={ciudades} cines={cines} onFilterChange={setFilters} />
        </aside>

        <div className="flex-1 pl-8">
          <MovieGrid movies={moviesToShow} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />
        </div>
      </div>

      {toast.visible && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-opacity ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default MovieBrowser;