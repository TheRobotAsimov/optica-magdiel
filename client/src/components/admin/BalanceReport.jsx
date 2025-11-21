import { useState, useEffect, useRef } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import reporteService from '../../service/reporteService';
import NavComponent from '../common/NavBar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

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
      // Start of current week (Monday)
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate.setDate(diff);
      break;
    }
    case 'month':
      // Start of current month
      startDate.setDate(1);
      break;
    case '6months':
      // 6 months ago
      startDate.setMonth(today.getMonth() - 6);
      startDate.setDate(1);
      break;
    case 'year':
      // Start of current year
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

const BalanceReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const reportRef = useRef(null);

  // Update dates when period changes
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
      const data = await reporteService.getBalanceReport(fechaInicio, fechaFin);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!reportData) return null;

    const { totales } = reportData;
    const total = totales.ingresos + totales.egresos;
    const ingresosPercent = total > 0 ? ((totales.ingresos / total) * 100).toFixed(1) : 0;
    const egresosPercent = total > 0 ? ((totales.egresos / total) * 100).toFixed(1) : 0;

    return {
      labels: [
        `Ingresos (${ingresosPercent}%)`,
        `Egresos (${egresosPercent}%)`
      ],
      datasets: [
        {
          data: [totales.ingresos, totales.egresos],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare data for line chart
  const prepareLineChartData = () => {
    if (!reportData) return null;

    return {
      labels: reportData.datosDiarios.map(d => formatDate(d.fecha)),
      datasets: [
        {
          label: 'Ingresos',
          data: reportData.datosDiarios.map(d => d.ingresos),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
          fill: false,
          borderWidth: 3,
        },
        {
          label: 'Egresos',
          data: reportData.datosDiarios.map(d => d.egresos),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          fill: false,
          borderWidth: 3,
        },
      ],
    };
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 13, weight: '600' },
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return context.label + ': $' + formatCurrency(context.parsed);
          }
        }
      }
    },
  };

  const lineChartOptions = {
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
    if (!reportData || !reportRef.current) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Reporte de Balance`, 20, 20);
    
    // Summary
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 32);
    doc.text(`Total Ingresos: $${formatCurrency(reportData.totales.ingresos)}`, 20, 40);
    doc.text(`Total Egresos: $${formatCurrency(reportData.totales.egresos)}`, 20, 48);
    doc.text(`Balance: $${formatCurrency(reportData.totales.balance)}`, 20, 56);

    let yPosition = 70;

    // Pie Chart
    if (pieChartRef.current) {
      try {
        const canvas1 = await html2canvas(pieChartRef.current, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const imgData1 = canvas1.toDataURL('image/png');
        const imgWidth = 280;
        const xPos = -40; // Center the chart
        const imgHeight = (canvas1.height * imgWidth) / canvas1.width;
        doc.addImage(imgData1, 'PNG', xPos, yPosition, imgWidth, imgHeight);
        yPosition += 85;
      } catch (error) {
        console.error('Error capturing pie chart:', error);
      }
    }

    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Line Chart
    if (lineChartRef.current) {
      try {
        const canvas2 = await html2canvas(lineChartRef.current, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const imgData2 = canvas2.toDataURL('image/png');
        doc.addImage(imgData2, 'PNG', 15, yPosition, 180, 70);
        yPosition += 78;
      } catch (error) {
        console.error('Error capturing line chart:', error);
      }
    }

    // Add new page for table
    doc.addPage();
    yPosition = 20;

    // Table
    const tableRows = reportData.datosDiarios.map(dia => [
      formatDate(dia.fecha),
      `$${formatCurrency(dia.ingresos)}`,
      `$${formatCurrency(dia.egresos)}`,
      `$${formatCurrency(dia.ingresos - dia.egresos)}`
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Ingresos', 'Egresos', 'Balance Diario']],
      body: tableRows,
      startY: yPosition,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: { 
        fillColor: [59, 130, 246],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 45 },
        2: { halign: 'right', cellWidth: 45 },
        3: { halign: 'right', cellWidth: 45 }
      }
    });

    doc.save(`reporte_balance_${fechaInicio}_${fechaFin}.pdf`);
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
                  <h1 className="text-3xl font-bold text-white">Reporte de Balance</h1>
                  <p className="text-blue-100 text-sm mt-1">Análisis de ingresos y egresos</p>
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
              Selección de Período
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Rango de Fechas
                </label>
                <div className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium">
                  {fechaInicio && fechaFin ? `${fechaInicio} - ${fechaFin}` : 'Seleccione un periodo'}
                </div>
              </div>

              <div></div>

              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 block opacity-0">Action</label>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedPeriod}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <BarChart3 className="h-5 w-5" />
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
                    <h2 className="text-2xl font-bold text-gray-900">
                      {fechaInicio} - {fechaFin}
                    </h2>
                    <p className="text-gray-600 text-sm">Período del reporte</p>
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
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-green-900 text-lg">Total Ingresos</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    ${formatCurrency(reportData.totales.ingresos)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-red-900 text-lg">Total Egresos</h3>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    ${formatCurrency(reportData.totales.egresos)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className={`bg-gradient-to-br p-6 border-l-4 ${
                  reportData.totales.balance >= 0
                    ? 'from-blue-50 to-indigo-50 border-blue-500'
                    : 'from-orange-50 to-red-50 border-orange-500'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-lg ${
                      reportData.totales.balance >= 0 ? 'text-blue-900' : 'text-orange-900'
                    }`}>
                      Balance
                    </h3>
                    <div className={`p-2 rounded-lg ${
                      reportData.totales.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        reportData.totales.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`} />
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${
                    reportData.totales.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    ${formatCurrency(reportData.totales.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Distribución Total de Ingresos vs Egresos
                </h3>
              </div>
              <div className="p-6">
                <div className="h-96 flex justify-center" ref={pieChartRef}>
                  <div className="w-full max-w-md">
                    <Pie data={preparePieChartData()} options={pieChartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Evolución Diaria de Ingresos y Egresos
                </h3>
              </div>
              <div className="p-6">
                <div className="h-96" ref={lineChartRef}>
                  <Line data={prepareLineChartData()} options={lineChartOptions} />
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
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Ingresos</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Egresos</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Balance Diario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.datosDiarios.map((dia, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDate(dia.fecha)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-green-600">
                            ${formatCurrency(dia.ingresos)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            ${formatCurrency(dia.egresos)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-bold ${
                            dia.ingresos - dia.egresos >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${formatCurrency(dia.ingresos - dia.egresos)}
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
                <BarChart3 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay datos para mostrar
              </h3>
              <p className="text-gray-500">
                Seleccione un periodo para generar el reporte
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceReport;