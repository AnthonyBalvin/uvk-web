import React, { useState } from 'react';
import { 
  Users, 
  Film, 
  Coffee, 
  Calendar, 
  BarChart3, 
  Settings, 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  UserCheck,
  Ticket,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Datos simulados para las estadísticas
  const stats = {
    totalClientes: 1248,
    ventasHoy: 2350,
    peliculasActivas: 12,
    ocupacionPromedio: 78
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'peliculas', label: 'Gestionar Películas', icon: Film },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'alimentos', label: 'Alimentos y Bebidas', icon: Coffee },
    { id: 'funciones', label: 'Programar Funciones', icon: Calendar },
    { id: 'salas', label: 'Gestionar Salas', icon: MapPin },
    { id: 'reservas', label: 'Reservas y Boletos', icon: Ticket },
    { id: 'reportes', label: 'Reportes', icon: TrendingUp },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Total Clientes</p>
                    <p className="text-3xl font-bold">{stats.totalClientes.toLocaleString()}</p>
                  </div>
                  <Users className="w-10 h-10 text-red-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Ventas Hoy</p>
                    <p className="text-3xl font-bold">S/. {stats.ventasHoy.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Películas Activas</p>
                    <p className="text-3xl font-bold">{stats.peliculasActivas}</p>
                  </div>
                  <Film className="w-10 h-10 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Ocupación Promedio</p>
                    <p className="text-3xl font-bold">{stats.ocupacionPromedio}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Actividad reciente y funciones próximas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Funciones de hoy */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-6 h-6 text-red-500 mr-2" />
                  Funciones de Hoy
                </h3>
                <div className="space-y-4">
                  {[
                    { pelicula: 'Avengers: Endgame', sala: 'Sala 1', hora: '14:30', ocupacion: 85 },
                    { pelicula: 'Spider-Man', sala: 'Sala 2', hora: '16:45', ocupacion: 92 },
                    { pelicula: 'The Batman', sala: 'Sala 3', hora: '19:20', ocupacion: 67 }
                  ].map((funcion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{funcion.pelicula}</p>
                        <p className="text-sm text-gray-600">{funcion.sala} - {funcion.hora}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">{funcion.ocupacion}%</p>
                        <p className="text-xs text-gray-500">ocupación</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ventas recientes */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 text-red-500 mr-2" />
                  Actividad Reciente
                </h3>
                <div className="space-y-4">
                  {[
                    { cliente: 'María García', accion: 'Compró 2 boletos', tiempo: 'hace 5 min' },
                    { cliente: 'Carlos López', accion: 'Reservó función premium', tiempo: 'hace 12 min' },
                    { cliente: 'Ana Rodríguez', accion: 'Compró combo familiar', tiempo: 'hace 18 min' }
                  ].map((actividad, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{actividad.cliente}</p>
                        <p className="text-sm text-gray-600">{actividad.accion}</p>
                      </div>
                      <p className="text-xs text-gray-500">{actividad.tiempo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Film className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Sección: {menuItems.find(item => item.id === activeSection)?.label}
            </h3>
            <p className="text-gray-600">
              Esta sección está en desarrollo. Aquí podrás gestionar {menuItems.find(item => item.id === activeSection)?.label.toLowerCase()}.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg mr-3">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">UVK CINES</h1>
              <p className="text-gray-400 text-xs">Panel Administrador</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menú de navegación */}
        <nav className="mt-6 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 mb-2 text-left rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Administrador</p>
              <p className="text-gray-400 text-xs">admin@uvkcines.com</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <Home className="w-4 h-4 mr-2" />
              <span className="text-sm">Inicio</span>
            </button>
            <button className="flex-1 flex items-center justify-center px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header superior */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                <span>Última actualización: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-6">
          {renderDashboardContent()}
        </main>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;