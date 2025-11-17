import { useState, useEffect, useRef } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { BarChart3, Download } from 'lucide-react';
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
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
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

    return {
      labels: [
        `Ingresos (${((totales.ingresos / (totales.ingresos + totales.egresos)) * 100).toFixed(1)}%)`,
        `Egresos (${((totales.egresos / (totales.ingresos + totales.egresos)) * 100).toFixed(1)}%)`
      ],
      datasets: [
        {
          data: [totales.ingresos, totales.egresos],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)', // Green for income
            'rgba(239, 68, 68, 0.8)',  // Red for expenses
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
        },
        {
          label: 'Egresos',
          data: reportData.datosDiarios.map(d => d.egresos),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1,
          fill: false,
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
        }
      },
      tooltip: {
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
      legend: { position: 'top' },
      tooltip: {
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
        ticks: {
          callback: function(value) {
            return '$' + formatCurrency(value);
          }
        }
      }
    }
  };

  const downloadPDF = async () => {
    if (!reportData || !reportRef.current) return;

    const doc = new jsPDF();
    doc.text(`Reporte de Balance`, 20, 20);
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 30);

    const { totales } = reportData;

    // Summary
    doc.text(`Total Ingresos: $${formatCurrency(totales.ingresos)}`, 20, 45);
    doc.text(`Total Egresos: $${formatCurrency(totales.egresos)}`, 20, 55);
    doc.text(`Balance: $${formatCurrency(totales.balance)}`, 20, 65);

    let yPosition = 80;

    // Charts
    if (pieChartRef.current) {
      const canvas1 = await html2canvas(pieChartRef.current);
      const imgData1 = canvas1.toDataURL('image/png');
      doc.addImage(imgData1, 'PNG', 20, yPosition, 80, 80);
      yPosition += 90;
    }

    if (lineChartRef.current) {
      const canvas2 = await html2canvas(lineChartRef.current);
      const imgData2 = canvas2.toDataURL('image/png');
      doc.addImage(imgData2, 'PNG', 20, yPosition, 170, 60);
      yPosition += 70;
    }

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
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    doc.save(`reporte_balance_${fechaInicio}_${fechaFin}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Reporte de Balance</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="">Seleccionar Periodo</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="year">Este año</option>
            </select>

            <div className="border rounded-lg p-2 bg-gray-50 text-gray-600">
              {fechaInicio && fechaFin ? `${fechaInicio} - ${fechaFin}` : 'Seleccione un periodo'}
            </div>

            <div></div> {/* Empty space for alignment */}

            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedPeriod}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg p-2 flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>

          {reportData && (
            <div ref={reportRef}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Rango de fechas: {fechaInicio} - {fechaFin}</h2>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-900">Total Ingresos</h3>
                  <p className="text-2xl font-bold text-green-700">
                    ${formatCurrency(reportData.totales.ingresos)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900">Total Egresos</h3>
                  <p className="text-2xl font-bold text-red-700">
                    ${formatCurrency(reportData.totales.egresos)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border-l-4 ${
                  reportData.totales.balance >= 0
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}>
                  <h3 className={`font-semibold ${
                    reportData.totales.balance >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Balance
                  </h3>
                  <p className={`text-2xl font-bold ${
                    reportData.totales.balance >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    ${formatCurrency(reportData.totales.balance)}
                  </p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Distribución Total de Ingresos vs Egresos</h3>
                <div className="h-96 flex justify-center" ref={pieChartRef}>
                  <div className="w-96">
                    <Pie data={preparePieChartData()} options={pieChartOptions} />
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Evolución Diaria de Ingresos y Egresos</h3>
                <div className="h-96" ref={lineChartRef}>
                  <Line data={prepareLineChartData()} options={lineChartOptions} />
                </div>
              </div>

              {/* Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Detalle Diario</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Ingresos</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Egresos</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Balance Diario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.datosDiarios.map((dia, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">{formatDate(dia.fecha)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-green-600 font-medium">
                            ${formatCurrency(dia.ingresos)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-red-600 font-medium">
                            ${formatCurrency(dia.egresos)}
                          </td>
                          <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${
                            dia.ingresos - dia.egresos >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${formatCurrency(dia.ingresos - dia.egresos)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 font-semibold flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </button>
            </div>
          )}

          {!reportData && !loading && (
            <div className="text-center text-gray-500 py-8">
              Seleccione un periodo para generar el reporte
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceReport;