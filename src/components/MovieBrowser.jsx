import React, { useState, useEffect } from 'react';
import FilterSidebar from './FilterSidebar.jsx';

// Componente para la cuadrícula de películas (sin cambios)
const MovieGrid = ({ movies }) => (
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
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e50914', boxShadow: '0 0 15px rgba(229, 9, 20, 0.6)' }}></div>
            </div>
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
          <MovieGrid movies={moviesToShow} />
        </div>
      </div>
    </>
  );
};

export default MovieBrowser;