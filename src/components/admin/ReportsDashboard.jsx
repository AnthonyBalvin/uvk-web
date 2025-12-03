import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function ReportsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTickets: 0,
        avgTicketPrice: 0,
        totalTransactions: 0,
        salesByMovie: [],
        paymentMethodsDistribution: [],
        revenueByPaymentMethod: [],
        statusDistribution: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch todas las compras
            const { data: compras, error: comprasError } = await supabase
                .from('compras')
                .select('id, monto_total, metodo_pago, mp_payment_status');

            if (comprasError) throw comprasError;

            // 2. Fetch todos los boletos con película
            const { data: boletos, error: boletosError } = await supabase
                .from('boletos')
                .select(`
          id,
          funciones (
            id,
            peliculas (
              titulo
            )
          )
        `);

            if (boletosError) throw boletosError;

            processData(compras, boletos);

        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (compras, boletos) => {
        // --- 1. KPIs Totales ---
        const totalRev = compras.reduce((sum, c) => sum + (c.monto_total || 0), 0);
        const totalTickets = boletos.length;
        const totalTransactions = compras.length;
        const avgTicket = totalTransactions > 0 ? totalRev / totalTransactions : 0;

        // --- 2. Top Películas por Boletos Vendidos ---
        const movieMap = {};
        boletos.forEach(boleto => {
            const titulo = boleto.funciones?.peliculas?.titulo || 'Desconocido';
            movieMap[titulo] = (movieMap[titulo] || 0) + 1;
        });

        const salesByMovie = Object.entries(movieMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6

        // --- 3. Distribución por Método de Pago ---
        const paymentMap = {};
        compras.forEach(c => {
            const method = c.metodo_pago || 'No especificado';
            paymentMap[method] = (paymentMap[method] || 0) + 1;
        });

        const paymentMethodsDistribution = Object.entries(paymentMap)
            .map(([name, value]) => ({ name: name === 'mercadopago' ? 'Mercado Pago' : name === 'efectivo' ? 'Efectivo' : name, value }));

        // --- 4. Ingresos por Método de Pago ---
        const revenueByMethod = {};
        compras.forEach(c => {
            const method = c.metodo_pago || 'No especificado';
            revenueByMethod[method] = (revenueByMethod[method] || 0) + (c.monto_total || 0);
        });

        const revenueByPaymentMethod = Object.entries(revenueByMethod)
            .map(([name, value]) => ({
                name: name === 'mercadopago' ? 'Mercado Pago' : name === 'efectivo' ? 'Efectivo' : name,
                value: parseFloat(value.toFixed(2))
            }));

        // --- 5. Distribución por Estado de Pago ---
        const statusMap = {};
        compras.forEach(c => {
            const status = c.mp_payment_status || 'Sin especificar';
            statusMap[status] = (statusMap[status] || 0) + 1;
        });

        const statusDistribution = Object.entries(statusMap)
            .map(([name, value]) => ({
                name: name === 'approved' ? 'Aprobado' : name === 'pending' ? 'Pendiente' : name === 'rejected' ? 'Rechazado' : name,
                value
            }));

        setStats({
            totalRevenue: totalRev,
            totalTickets,
            avgTicketPrice: avgTicket,
            totalTransactions,
            salesByMovie,
            paymentMethodsDistribution,
            revenueByPaymentMethod,
            statusDistribution
        });
    };

    const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* --- KPIs Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-green-700 uppercase">Ingresos Totales</h3>
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-900">S/ {stats.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-green-600 mt-2">Total acumulado</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-blue-700 uppercase">Boletos Vendidos</h3>
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalTickets}</p>
                    <p className="text-xs text-blue-600 mt-2">Total histórico</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-purple-700 uppercase">Ticket Promedio</h3>
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">S/ {stats.avgTicketPrice.toFixed(2)}</p>
                    <p className="text-xs text-purple-600 mt-2">Por transacción</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-orange-700 uppercase">Transacciones</h3>
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">{stats.totalTransactions}</p>
                    <p className="text-xs text-orange-600 mt-2">Compras totales</p>
                </div>
            </div>

            {/* --- Charts Row 1: Top Movies & Payment Distribution --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 6 Movies */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        Top 6 Películas Más Vendidas
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesByMovie} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: '#fef2f2' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#EF4444" radius={[0, 8, 8, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Métodos de Pago (Cantidad)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.paymentMethodsDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.paymentMethodsDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- Charts Row 2: Revenue By Method & Status Distribution --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue by Payment Method */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Ingresos por Método de Pago
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.revenueByPaymentMethod}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `S/${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Ingresos']}
                                />
                                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Estado de Transacciones
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {stats.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- Summary Stats Table --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Resumen General
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Películas</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.salesByMovie.length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Película Top</p>
                        <p className="text-sm font-bold text-gray-900 mt-1 truncate">{stats.salesByMovie[0]?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{stats.salesByMovie[0]?.value || 0} boletos</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Método Favorito</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{stats.paymentMethodsDistribution[0]?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{stats.paymentMethodsDistribution[0]?.value || 0} usos</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Tasa Aprobación</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {stats.totalTransactions > 0
                                ? ((stats.statusDistribution.find(s => s.name === 'Aprobado')?.value || 0) / stats.totalTransactions * 100).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
