import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    X,
    Loader2,
    Calendar,
    CreditCard,
    User,
    Mail,
    Phone,
    FileText
} from 'lucide-react';

export default function SalesList() {
    // Data States
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // UI States
    const [isExporting, setIsExporting] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null); // Para el Modal
    const [showFilters, setShowFilters] = useState(false);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchSales();
    }, [page, searchTerm, statusFilter, paymentMethodFilter]);

    const buildQuery = (query) => {
        if (searchTerm) {
            query = query.or(`email_contacto.ilike.%${searchTerm}%,nombre_contacto.ilike.%${searchTerm}%`);
        }
        if (statusFilter !== 'all') {
            query = query.eq('mp_payment_status', statusFilter);
        }
        if (paymentMethodFilter !== 'all') {
            query = query.eq('metodo_pago', paymentMethodFilter);
        }
        return query;
    };

    const fetchSales = async () => {
        try {
            setLoading(true);
            setError(null);

            let countQuery = supabase.from('compras').select('*', { count: 'exact', head: true });
            countQuery = buildQuery(countQuery);
            const { count, error: countError } = await countQuery;
            if (countError) throw countError;

            setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));

            let dataQuery = supabase
                .from('compras')
                .select('*')
                .order('id', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            dataQuery = buildQuery(dataQuery);
            const { data, error: dataError } = await dataQuery;
            if (dataError) throw dataError;

            setSales(data);
        } catch (err) {
            console.error('Error fetching sales:', err);
            setError('Error al cargar las ventas. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setIsExporting(true); // Activar loading del botón

            // Simular un pequeño delay para que se vea la animación (opcional, mejora UX visual)
            await new Promise(resolve => setTimeout(resolve, 500));

            let query = supabase
                .from('compras')
                .select('*')
                .order('id', { ascending: false });
            query = buildQuery(query);
            const { data, error } = await query;

            if (error) throw error;
            if (!data || data.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            const doc = new jsPDF();

            // Header con estilo
            doc.setFillColor(220, 38, 38); // Rojo UVK
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE VENTAS - UVK CINES', 14, 13);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado el: ${new Date().toLocaleString('es-PE')}`, 14, 30);
            doc.text(`Total de registros: ${data.length}`, 14, 35);

            const tableColumn = ["ID Corto", "Cliente", "Email", "Método", "Total", "Estado"];
            const tableRows = [];

            data.forEach(sale => {
                const saleData = [
                    sale.id.slice(0, 8),
                    sale.nombre_contacto || 'Anónimo',
                    sale.email_contacto || '-',
                    sale.metodo_pago,
                    `S/ ${sale.monto_total.toFixed(2)}`,
                    sale.mp_payment_status || 'pending'
                ];
                tableRows.push(saleData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                theme: 'striped',
                headStyles: {
                    fillColor: [220, 38, 38],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [249, 250, 251] }
            });

            doc.save(`reporte_ventas_${new Date().toISOString().slice(0, 10)}.pdf`);

        } catch (err) {
            console.error('Error al exportar PDF:', err);
            alert('Error al exportar PDF: ' + err.message);
        } finally {
            setIsExporting(false); // Desactivar loading
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: "bg-green-100 text-green-700 border-green-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            rejected: "bg-red-100 text-red-700 border-red-200",
            default: "bg-gray-100 text-gray-700 border-gray-200"
        };

        const icons = {
            approved: <CheckCircle className="w-3 h-3 mr-1.5" />,
            pending: <Clock className="w-3 h-3 mr-1.5" />,
            rejected: <XCircle className="w-3 h-3 mr-1.5" />,
            default: <AlertCircle className="w-3 h-3 mr-1.5" />
        };

        const statusKey = ['approved', 'pending', 'rejected'].includes(status) ? status : 'default';

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[statusKey]}`}>
                {icons[statusKey]}
                {status === 'approved' ? 'Aprobado' : status === 'pending' ? 'Pendiente' : status === 'rejected' ? 'Rechazado' : status}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* --- Header Controls --- */}
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-lg group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
                            placeholder="Buscar por cliente o correo electrónico..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center px-4 py-2.5 border rounded-xl font-medium text-sm transition-all shadow-sm ${showFilters
                                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </button>

                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting || loading}
                            className={`flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado del Pago</label>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none bg-gray-50 hover:bg-white transition-colors"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="approved">Aprobado</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="rejected">Rechazado</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Método de Pago</label>
                            <select
                                value={paymentMethodFilter}
                                onChange={(e) => { setPaymentMethodFilter(e.target.value); setPage(1); }}
                                className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-gray-50 hover:bg-white transition-colors"
                            >
                                <option value="all">Todos los métodos</option>
                                <option value="mercadopago">Mercado Pago</option>
                                <option value="efectivo">Efectivo</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setPaymentMethodFilter('all');
                                    setSearchTerm('');
                                    setPage(1);
                                }}
                                className="text-sm text-red-600 hover:text-red-800 font-medium py-2 px-4 hover:bg-red-50 rounded-lg transition-colors w-full md:w-auto"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Main Table --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Compra</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-red-500">
                                            <AlertCircle className="w-8 h-8 mb-2" />
                                            <p>{error}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium">No se encontraron ventas</p>
                                            <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                #{sale.id.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{sale.nombre_contacto || 'Cliente Anónimo'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col space-y-0.5">
                                                <div className="flex items-center text-gray-600">
                                                    <Mail className="w-3 h-3 mr-1.5 text-gray-400" />
                                                    {sale.email_contacto}
                                                </div>
                                                {sale.telefono_contacto && (
                                                    <div className="flex items-center text-xs text-gray-400">
                                                        <Phone className="w-3 h-3 mr-1.5" />
                                                        {sale.telefono_contacto}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            <div className="flex items-center">
                                                <CreditCard className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                                {sale.metodo_pago}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {formatCurrency(sale.monto_total)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {getStatusBadge(sale.mp_payment_status || sale.estado || 'pending')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Ver detalles completos"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        Mostrando página <span className="font-semibold text-gray-900">{page}</span> de <span className="font-semibold text-gray-900">{totalPages}</span>
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- DETAILS MODAL --- */}
            {selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop con Blur */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedSale(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                                    Detalle de Venta
                                </h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedSale.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Status Banner */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Estado de la transacción</p>
                                    <div className="scale-105 origin-left">
                                        {getStatusBadge(selectedSale.mp_payment_status || selectedSale.estado)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">Monto Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedSale.monto_total)}</p>
                                </div>
                            </div>

                            {/* Grid Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Column 1: Customer */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center border-b pb-2">
                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                        Información del Cliente
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">Nombre Completo</p>
                                            <p className="font-medium text-gray-900">{selectedSale.nombre_contacto || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Correo Electrónico</p>
                                            <p className="font-medium text-gray-900">{selectedSale.email_contacto}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Teléfono</p>
                                            <p className="font-medium text-gray-900">{selectedSale.telefono_contacto || 'No registrado'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Payment & Metadata */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center border-b pb-2">
                                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                        Datos del Pago
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">Método de Pago</p>
                                            <p className="font-medium text-gray-900 capitalize">{selectedSale.metodo_pago}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">ID MercadoPago</p>
                                            <p className="font-medium text-gray-900 font-mono text-xs">{selectedSale.mp_payment_id || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Raw Data (Opcional, si quieres mostrar JSON o metadata extra) */}
                            {selectedSale.metadata && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-2">Metadata adicional</p>
                                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                                        {JSON.stringify(selectedSale.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cerrar
                            </button>
                            {/* Botón opcional dentro del modal si quieres imprimir solo este registro */}
                            {/* <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                                Imprimir Ticket
                            </button> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}