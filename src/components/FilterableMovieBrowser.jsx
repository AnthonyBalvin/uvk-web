import React, { useState, useEffect } from 'react';
import FilterSidebar from './FilterSidebar.jsx';

// El componente MovieGrid no necesita cambios
const MovieGrid = ({ movies }) => (
  <div className="flex-1 p-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {movies.length > 0 ? (
        movies.map((pelicula) => (
          <a href={`/${pelicula.id}`} key={pelicula.id} className="block group">
            <div className="rounded-xl overflow-hidden hover:transform hover:-translate-y-3 hover:shadow-2xl transition-all duration-300 relative border-2 movie-card" style={{ backgroundColor: '#ffffff', borderColor: '#e5ddd0', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
              <div className="aspect-[3/4] overflow-hidden">
                <img src={pelicula.imagen_url || '/images/placeholder.jpg'} alt={`Carátula de ${pelicula.titulo}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="p-6" style={{ background: 'linear-gradient(to bottom, #ffffff, #fafafa);' }}>
                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-red-500 transition-colors duration-300" style={{ color: '#2c2c2c' }}>{pelicula.titulo}</h2>
                <p className="text-sm font-medium" style={{ color: '#666666' }}>{pelicula.genero}, {pelicula.duracion}min, +{pelicula.clasificacion || '14'}.</p>
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
  </div>
);

// --- COMPONENTE PRINCIPAL CON LA LÓGICA DE LA BARRA LATERAL CORREGIDA ---
const FilterableMovieBrowser = ({ moviesEnCartelera, proximosEstrenos, shows, ciudades, cines }) => {
  const [activeTab, setActiveTab] = useState('cartelera');
  const [filters, setFilters] = useState({ city: '', cinema: '', genre: '', day: '' });
  const [filteredMovies, setFilteredMovies] = useState(moviesEnCartelera || []);

  // Efecto para limpiar los filtros cuando se cambia a la pestaña de estrenos
  useEffect(() => {
    if (activeTab === 'estrenos') {
      setFilters({ city: '', cinema: '', genre: '', day: '' });
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'cartelera') {
      setFilteredMovies([]); // Limpiamos las películas filtradas
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
    <div className="container mx-auto px-8">
      <div className="border-b pb-8 mb-8" style={{ borderColor: '#e5ddd0' }}>
        <div className="flex items-center py-8">
          <h1 className="text-5xl font-bold mr-12" style={{ color: '#e50914' }}>Películas</h1>
          <nav className="flex space-x-12">
            <button
              onClick={() => setActiveTab('cartelera')}
              className={`text-xl pb-3 transition-all duration-200 ${activeTab === 'cartelera' ? 'font-bold border-b-2 border-red-600' : 'font-semibold text-gray-500 hover:text-red-600'}`}
              style={activeTab === 'cartelera' ? { color: '#e50914' } : {}}
            >
              En cartelera
            </button>
            <button
              onClick={() => setActiveTab('estrenos')}
              className={`text-xl pb-3 transition-all duration-200 ${activeTab === 'estrenos' ? 'font-bold border-b-2 border-red-600' : 'font-semibold text-gray-500 hover:text-red-600'}`}
              style={activeTab === 'estrenos' ? { color: '#e50914' } : {}}
            >
              Próximos estrenos
            </button>
          </nav>
        </div>
      </div>

      <div className="flex">
        {/* --- ESTA ES LA SECCIÓN CORREGIDA --- */}
        {/* La barra lateral ahora siempre está presente, pero se desactiva visualmente */}
        <aside 
          className={`w-80 flex-shrink-0 transition-opacity duration-300 ${activeTab !== 'cartelera' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        >
          <FilterSidebar
            ciudades={ciudades}
            cines={cines}
            onFilterChange={setFilters}
          />
        </aside>
        
        <MovieGrid movies={moviesToShow} />
      </div>
    </div>
  );
};

export default FilterableMovieBrowser;