// src/components/FilterSidebar.jsx
import React, { useState } from 'react';

const FilterSidebar = ({ ciudades, cines }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    ciudad: false,
    cine: false
  });

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="py-6" style={{ borderBottom: '2px solid #e5ddd0' }}>
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full text-left transition-all duration-300"
        style={{ color: '#2c2c2c' }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#e50914';
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#2c2c2c';
          e.currentTarget.style.transform = 'translateX(0px)';
        }}
      >
        <span className="font-bold text-xl">{title}</span>
        <span 
          className="text-3xl font-light transition-transform duration-300" 
          style={{ 
            color: '#666666',
            transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
        >
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      {isExpanded && (
        <div className="mt-6 transform transition-all duration-300" style={{ opacity: isExpanded ? 1 : 0 }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="p-8 min-h-screen border-r-2"
      style={{ 
        background: 'linear-gradient(180deg, #faf7f2 0%, #f5f0ea 50%, #f0e9e2 100%)',
        borderColor: '#e5ddd0',
        boxShadow: 'inset -5px 0 15px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-center mb-10">
        <div className="w-8 h-8 mr-4 flex items-center justify-center rounded-full" style={{ backgroundColor: '#e50914' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
            <path d="M3 7H21L19 12H5L3 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 7L3 2" stroke="currentColor" strokeWidth="2"/>
            <path d="M19 7L21 2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="9" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
            <circle cx="15" cy="19" r="1" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h3 className="text-3xl font-bold" style={{ color: '#e50914', textShadow: '1px 1px 3px rgba(229, 9, 20, 0.1)' }}>
          Filtrar Por:
        </h3>
      </div>

      <FilterSection
        title="Ciudad"
        isExpanded={expandedSections.ciudad}
        onToggle={() => toggleSection('ciudad')}
      >
        <select
          className="w-full p-4 border-2 rounded-xl focus:outline-none transition-all duration-300 text-lg font-medium"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5ddd0',
            color: '#2c2c2c',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#e50914';
            e.target.style.boxShadow = '0 0 0 3px rgba(229, 9, 20, 0.1), 0 4px 20px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5ddd0';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
            e.target.style.transform = 'translateY(0px)';
          }}
          value={selectedCity}
          onChange={handleCityChange}
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map((city) => (
            <option key={city.id} value={city.nombre} style={{ backgroundColor: '#ffffff', padding: '10px' }}>
              {city.nombre}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection
        title="Cine"
        isExpanded={expandedSections.cine}
        onToggle={() => toggleSection('cine')}
      >
        <select
          className="w-full p-4 border-2 rounded-xl focus:outline-none transition-all duration-300 text-lg font-medium"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5ddd0',
            color: '#2c2c2c',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#e50914';
            e.target.style.boxShadow = '0 0 0 3px rgba(229, 9, 20, 0.1), 0 4px 20px rgba(0, 0, 0, 0.1)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5ddd0';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
            e.target.style.transform = 'translateY(0px)';
          }}
          value={selectedCinema}
          onChange={handleCinemaChange}
        >
          <option value="">Todos los cines</option>
          {cines.map((cinema) => (
            <option key={cinema.id} value={cinema.nombre} style={{ backgroundColor: '#ffffff', padding: '10px' }}>
              {cinema.nombre}
            </option>
          ))}
        </select>
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;