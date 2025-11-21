import { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { 
  PieChart, 
  Download, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import reporteService from '../../service/reporteService';
import NavComponent from '../common/NavBar';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Safe number conversion utility
const toNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Format currency with commas for thousands
const formatCurrency = (value) => {
  const num = toNumber(value);
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Calculate date range based on selected period
const getDateRange = (period) => {
  const today = new Date();
  const startDate = new Date();
  let endDate = new Date(today);

  switch (period) {
    case 'week': {
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate.setDate(diff);
      break;
    }
    case 'month':
      startDate.setDate(1);
      break;
    case '6months':
      startDate.setMonth(today.getMonth() - 6);
      startDate.setDate(1);
      break;
    case 'year':
      startDate.setMonth(0);
      startDate.setDate(1);
      break;
    default:
      return { start: '', end: '' };
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

const PagosClientesReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    if (selectedPeriod) {
      const { start, end } = getDateRange(selectedPeriod);
      setFechaInicio(start);
      setFechaFin(end);
    }
  }, [selectedPeriod]);

  const handleGenerateReport = async () => {
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      const data = await reporteService.getPagosClientes(fechaInicio, fechaFin);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!reportData) return null;

    const { estadisticasPagos } = reportData;

    return {
      labels: [
        `Pagos Completados (${estadisticasPagos.completados.porcentaje.toFixed(1)}%)`,
        `Pagos Atrasados (${estadisticasPagos.atrasados.porcentaje.toFixed(1)}%)`
      ],
      datasets: [
        {
          data: [
            estadisticasPagos.completados.monto,
            estadisticasPagos.atrasados.monto
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 13,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: $${formatCurrency(value)}`;
          }
        }
      }
    },
  };

  const downloadPDF = async () => {
    if (!reportData || !reportRef.current) return;

    const doc = new jsPDF();
    
    // --- Encabezados ---
    doc.setFontSize(18);
    doc.text(`Reporte de Pagos de Clientes`, 20, 20);
    doc.setFontSize(11);
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 30);

    const { estadisticasPagos } = reportData;

    // --- Resumen de Texto ---
    doc.text(`Total de Pagos: ${estadisticasPagos.total.cantidad}`, 20, 45);
    doc.text(`Monto Total: $${formatCurrency(estadisticasPagos.total.monto)}`, 20, 55);
    doc.text(`Pagos Completados: ${estadisticasPagos.completados.cantidad} ($${formatCurrency(estadisticasPagos.completados.monto)})`, 20, 65);
    doc.text(`Pagos Atrasados: ${estadisticasPagos.atrasados.cantidad} ($${formatCurrency(estadisticasPagos.atrasados.monto)})`, 20, 75);

    // Variable para controlar dónde empieza la tabla (se ajustará según el tamaño de la imagen)
    let finalY = 85; 

    // --- GRÁFICA ---
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');

      // 1. ANCHO MÁXIMO: Usamos 180 (dejando solo 15mm de margen a cada lado)
      // Una hoja A4 mide 210mm de ancho.
      const imgWidth = 300; 
      const xPos = -50; // Centramos un poco reduciendo el margen izquierdo

      // 2. ALTO PROPORCIONAL: Calculamos la altura para que NO se deforme
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', xPos, finalY, imgWidth, imgHeight);
      
      // Actualizamos la posición para que la tabla empiece DEBAJO de la gráfica
      finalY += imgHeight + 10; 
    } else {
      finalY += 10;
    }

    // --- TABLA ---
    const tableRows = reportData.clientesMorosos.map(cliente => [
      cliente.nombreCliente,
      cliente.folio,
      formatDate(cliente.fechaVenta),
      `$${formatCurrency(cliente.monto)}`,
      cliente.diasAtraso,
      `$${formatCurrency(cliente.indiceMorosidad)}`
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Folio', 'Fecha Venta', 'Monto', 'Días Atraso', 'Índice Morosidad']],
      body: tableRows,
      // IMPORTANTE: Usamos 'finalY' aquí en lugar de un número fijo
      startY: finalY, 
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] },
      columnStyles: {
        3: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    doc.save(`reporte_pagos_clientes_${fechaInicio}_${fechaFin}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Reporte de Pagos de Clientes
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Análisis de pagos completados y atrasados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Filtros de Búsqueda
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Period Select */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                  Período
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium bg-white hover:border-gray-300"
                >
                  <option value="">Seleccionar Periodo</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="6months">Últimos 6 meses</option>
                  <option value="year">Este año</option>
                </select>
              </div>

              {/* Date Range Display */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-600" />
                  Rango de Fechas
                </label>
                <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-medium flex items-center">
                  {fechaInicio && fechaFin ? (
                    <span className="text-sm">{fechaInicio} → {fechaFin}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Seleccione un periodo</span>
                  )}
                </div>
              </div>

              {/* Empty space for alignment */}
              <div className="hidden lg:block"></div>

              {/* Generate Button */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 block opacity-0">Action</label>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedPeriod}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <PieChart className="h-5 w-5" />
                  <span>{loading ? 'Generando...' : 'Generar Reporte'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {reportData && (
          <div ref={reportRef}>
            {/* Date Info */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Período Analizado</h2>
                    <p className="text-gray-600 text-sm">{fechaInicio} - {fechaFin}</p>
                  </div>
                </div>
                <button
                  onClick={downloadPDF}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="h-5 w-5" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Pagos Completados */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-green-900 text-lg">Pagos Completados</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-700 mb-2">
                    {reportData.estadisticasPagos.completados.cantidad}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1.5 rounded-lg">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${formatCurrency(reportData.estadisticasPagos.completados.monto)}
                    </div>
                    <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1.5 rounded-lg">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {reportData.estadisticasPagos.completados.porcentaje.toFixed(1)}% del total
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagos Atrasados */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-red-900 text-lg">Pagos Atrasados</h3>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-red-700 mb-2">
                    {reportData.estadisticasPagos.atrasados.cantidad}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-red-600 bg-red-100 px-3 py-1.5 rounded-lg">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${formatCurrency(reportData.estadisticasPagos.atrasados.monto)}
                    </div>
                    <div className="flex items-center text-sm text-red-600 bg-red-100 px-3 py-1.5 rounded-lg">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {reportData.estadisticasPagos.atrasados.porcentaje.toFixed(1)}% del total
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-900 text-lg">Total de Pagos</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-700 mb-2">
                    {reportData.estadisticasPagos.total.cantidad}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${formatCurrency(reportData.estadisticasPagos.total.monto)}
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br mb-7 from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                  Distribución de Pagos
                </h3>
              </div>
              <div className='mb-6'>
                {/* 1. Aumentamos h-[300px] a h-[500px] (o h-96 si prefieres Tailwind) */}
                <div className="h-[400px] flex justify-center items-center w-full" ref={chartRef}>
                  
                  {/* 2. Añadimos 'h-full' y 'relative' para que Chart.js ocupe el espacio */}
                  <div className="w-full max-w-2xl h-full relative">
                    <Pie data={prepareChartData()} options={chartOptions} />
                  </div>

                </div>
              </div>
            </div>

            {/* Delinquent Clients Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-red-50 to-rose-50 px-6 py-4 border-b border-red-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-red-600" />
                  Clientes con Mayor Índice de Morosidad
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha Venta</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Días Atraso</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Índice Morosidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.clientesMorosos.map((cliente, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-lg mr-3">
                              <Users className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {cliente.nombreCliente}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                            {formatDate(cliente.fechaVenta)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            ${formatCurrency(cliente.monto)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {cliente.diasAtraso} días
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            ${formatCurrency(cliente.indiceMorosidad)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!reportData && !loading && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-12">
            <div className="text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay datos para mostrar
              </h3>
              <p className="text-gray-500">
                Seleccione un período para generar el reporte de pagos
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagosClientesReport;