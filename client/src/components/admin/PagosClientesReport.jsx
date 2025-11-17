import { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
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

const PagosClientesReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
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
            'rgba(34, 197, 94, 0.8)', // Green for completed
            'rgba(239, 68, 68, 0.8)',  // Red for overdue
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

  const chartOptions = {
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
    doc.text(`Reporte de Pagos de Clientes`, 20, 20);
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 30);

    const { estadisticasPagos } = reportData;

    // Summary
    doc.text(`Total de Pagos: ${estadisticasPagos.total.cantidad}`, 20, 45);
    doc.text(`Monto Total: $${formatCurrency(estadisticasPagos.total.monto)}`, 20, 55);
    doc.text(`Pagos Completados: ${estadisticasPagos.completados.cantidad} ($${formatCurrency(estadisticasPagos.completados.monto)})`, 20, 65);
    doc.text(`Pagos Atrasados: ${estadisticasPagos.atrasados.cantidad} ($${formatCurrency(estadisticasPagos.atrasados.monto)})`, 20, 75);

    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 85, 170, 80);
    }

    // Delinquent clients table
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
      startY: 175,
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
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Reporte de Pagos de Clientes</h1>

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
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg p-2"
            >
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
                  <h3 className="font-semibold text-green-900">Pagos Completados</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {reportData.estadisticasPagos.completados.cantidad}
                  </p>
                  <p className="text-sm text-green-600">
                    ${formatCurrency(reportData.estadisticasPagos.completados.monto)} ({reportData.estadisticasPagos.completados.porcentaje.toFixed(1)}%)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900">Pagos Atrasados</h3>
                  <p className="text-2xl font-bold text-red-700">
                    {reportData.estadisticasPagos.atrasados.cantidad}
                  </p>
                  <p className="text-sm text-red-600">
                    ${formatCurrency(reportData.estadisticasPagos.atrasados.monto)} ({reportData.estadisticasPagos.atrasados.porcentaje.toFixed(1)}%)
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-900">Total</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {reportData.estadisticasPagos.total.cantidad}
                  </p>
                  <p className="text-sm text-blue-600">
                    ${formatCurrency(reportData.estadisticasPagos.total.monto)}
                  </p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Distribución de Pagos</h3>
                <div className="h-96 flex justify-center" ref={chartRef}>
                  <div className="w-96">
                    <Pie data={prepareChartData()} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Delinquent Clients Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Clientes con Mayor Índice de Morosidad</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Fecha Venta</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Monto</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Días Atraso</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Índice Morosidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.clientesMorosos.map((cliente, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">{cliente.nombreCliente}</td>
                          <td className="border border-gray-300 px-4 py-2">{formatDate(cliente.fechaVenta)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-red-600 font-medium">
                            ${formatCurrency(cliente.monto)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{cliente.diasAtraso}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-red-600 font-medium">
                            ${formatCurrency(cliente.indiceMorosidad)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 font-semibold"
              >
                📄 Descargar PDF
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

export default PagosClientesReport;