import { useState, useEffect, useRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart3, Download, Calendar, User, TrendingUp, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import reporteService from '../../service/reporteService';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const DesempenoAsesorReport = () => {
  const [asesores, setAsesores] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const data = await empleadoService.getEmpleadosByPuesto('Asesor');
        setAsesores(data);
      } catch (error) {
        console.error('Error fetching asesores:', error);
      }
    };
    fetchAsesores();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      const { start, end } = getDateRange(selectedPeriod);
      setFechaInicio(start);
      setFechaFin(end);
    }
  }, [selectedPeriod]);

  const handleGenerateReport = async () => {
    if (!selectedAsesor || !fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      const data = await reporteService.getDesempenoAsesor(selectedAsesor, fechaInicio, fechaFin);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const mergedData = useMemo(() => {
    if (!reportData) return null;

    const dataMap = {};
    
    reportData.ventasDiarias.forEach(v => {
      const date = v.fecha.split('T')[0];
      dataMap[date] = { ventas: toNumber(v.total_ventas), gastos: 0 };
    });

    reportData.gastosDiarios.forEach(g => {
      const date = g.fecha.split('T')[0];
      if (dataMap[date]) {
        dataMap[date].gastos = toNumber(g.total_gastos);
      } else {
        dataMap[date] = { ventas: 0, gastos: toNumber(g.total_gastos) };
      }
    });

    const sortedDates = Object.keys(dataMap).sort();
    
    return {
      labels: sortedDates,
      ventas: sortedDates.map(date => dataMap[date].ventas),
      gastos: sortedDates.map(date => dataMap[date].gastos),
      utilidad: sortedDates.map(date => dataMap[date].ventas - dataMap[date].gastos),
      tableData: sortedDates.map(date => ({
        date,
        ventas: dataMap[date].ventas,
        gastos: dataMap[date].gastos,
        utilidad: dataMap[date].ventas - dataMap[date].gastos
      }))
    };
  }, [reportData]);

  const prepareChartData = () => {
    if (!mergedData) return null;

    return {
      labels: mergedData.labels.map(formatDate),
      datasets: [
        {
          label: 'Ventas',
          data: mergedData.ventas,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Gastos de Ruta',
          data: mergedData.gastos,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: { size: 13, weight: '600' },
          padding: 15,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': $' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 12, weight: '500' },
          callback: function(value) {
            return '$' + formatCurrency(value);
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '500' },
        }
      }
    }
  };

  const downloadPDF = async () => {
    if (!reportData || !mergedData) return;

    const doc = new jsPDF();
    doc.text(`Reporte de Desempeño - ${reportData.asesor.nombre}`, 20, 20);
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 30);

    const totalVentas = toNumber(reportData.totales.ventas);
    const totalGastos = toNumber(reportData.totales.gastos);
    const totalUtilidad = totalVentas - totalGastos;
    const avgVentas = toNumber(reportData.promedios.ventasPorDia);
    const avgGastos = toNumber(reportData.promedios.gastosPorDia);
    const avgUtilidad = avgVentas - avgGastos;

    doc.text(`Total Ventas: $${formatCurrency(totalVentas)}`, 20, 45);
    doc.text(`Total Gastos de Ruta: $${formatCurrency(totalGastos)}`, 20, 55);
    doc.text(`Utilidad Neta: $${formatCurrency(totalUtilidad)}`, 20, 65);
    doc.text(`Prom. Ventas/día: $${formatCurrency(avgVentas)}`, 20, 75);
    doc.text(`Prom. Gastos/día: $${formatCurrency(avgGastos)}`, 20, 85);
    doc.text(`Prom. Utilidad/día: $${formatCurrency(avgUtilidad)}`, 20, 95);

    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 105, 170, 80);
    }

    const tableRows = mergedData.tableData.map(row => [
      formatDate(row.date),
      `$${formatCurrency(row.ventas)}`,
      `$${formatCurrency(row.gastos)}`,
      `$${formatCurrency(row.utilidad)}`
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Ventas', 'Gastos de Ruta', 'Utilidad']],
      body: tableRows,
      startY: 195,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    doc.save(`reporte_desempeno_${reportData.asesor.nombre}.pdf`);
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
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Reporte de Desempeño por Asesor
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Análisis de ventas, gastos y utilidad por período
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
              {/* Asesor Select */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1.5 text-blue-600" />
                  Asesor
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={selectedAsesor}
                  onChange={(e) => setSelectedAsesor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium bg-white hover:border-gray-300"
                >
                  <option value="">Seleccionar Asesor</option>
                  {asesores.map(asesor => (
                    <option key={asesor.idempleado} value={asesor.idempleado}>
                      {asesor.nombre} {asesor.paterno}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* Generate Button */}
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 block opacity-0">Action</label>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedAsesor || !selectedPeriod}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>{loading ? 'Generando...' : 'Generar Reporte'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {reportData && mergedData && (
          <>
            {/* Asesor Info */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{reportData.asesor.nombre}</h2>
                    <p className="text-gray-600 text-sm">Período: {fechaInicio} - {fechaFin}</p>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Total Ventas */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-900 text-lg">Total Ventas</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-700 mb-2">
                    ${formatCurrency(reportData.totales.ventas)}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Prom/día: ${formatCurrency(reportData.promedios.ventasPorDia)}
                  </div>
                </div>
              </div>

              {/* Total Gastos */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-red-900 text-lg">Total Gastos</h3>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-red-700 mb-2">
                    ${formatCurrency(reportData.totales.gastos)}
                  </p>
                  <div className="flex items-center text-sm text-red-600 bg-red-100 px-3 py-1.5 rounded-lg">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Prom/día: ${formatCurrency(reportData.promedios.gastosPorDia)}
                  </div>
                </div>
              </div>

              {/* Utilidad Neta */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-green-900 text-lg">Utilidad Neta</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-700 mb-2">
                    ${formatCurrency(toNumber(reportData.totales.ventas) - toNumber(reportData.totales.gastos))}
                  </p>
                  <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1.5 rounded-lg">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Prom/día: ${formatCurrency(toNumber(reportData.promedios.ventasPorDia) - toNumber(reportData.promedios.gastosPorDia))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Gráfico de Desempeño
                </h3>
              </div>
              <div className="p-6">
                <div className="h-96" ref={chartRef}>
                  <Bar data={prepareChartData()} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Detalle Diario
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Ventas</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Gastos de Ruta</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Utilidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mergedData.tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(row.date)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-blue-600">
                            ${formatCurrency(row.ventas)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            ${formatCurrency(row.gastos)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-bold ${row.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${formatCurrency(row.utilidad)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!reportData && !loading && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-12">
            <div className="text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay datos para mostrar
              </h3>
              <p className="text-gray-500">
                Seleccione un asesor y período para generar el reporte
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesempenoAsesorReport;