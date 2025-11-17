import { useState, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import reporteService from '../../service/reporteService';
import NavComponent from '../common/NavBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
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

const RutasReport = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null);
  const reportRef = useRef(null);

  const handleGenerateReport = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const data = await reporteService.getRutasReport(selectedDate);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for first bar chart (quantities)
  const prepareQuantityChartData = () => {
    if (!reportData) return null;

    return {
      labels: reportData.asesores.map(asesor => asesor.nombre),
      datasets: [
        {
          label: 'Ventas Realizadas',
          data: reportData.asesores.map(asesor => asesor.ventas.cantidad),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
        {
          label: 'Gastos Realizados',
          data: reportData.asesores.map(asesor => asesor.gastos.cantidad),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
        },
        {
          label: 'Entregas Completadas',
          data: reportData.asesores.map(asesor => asesor.entregas.completadas),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
        {
          label: 'Entregas Pendientes',
          data: reportData.asesores.map(asesor => asesor.entregas.pendientes),
          backgroundColor: 'rgba(255, 206, 86, 0.7)',
          borderColor: 'rgb(255, 206, 86)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for second bar chart (amounts)
  const prepareAmountChartData = () => {
    if (!reportData) return null;

    return {
      labels: reportData.asesores.map(asesor => asesor.nombre),
      datasets: [
        {
          label: 'Dinero Recibido por Pagos',
          data: reportData.asesores.map(asesor => asesor.pagos.monto),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Dinero Perdido por Gastos',
          data: reportData.asesores.map(asesor => asesor.gastos.monto),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!reportData) return null;

    const { totales_generales } = reportData;

    return {
      labels: [
        `Dinero Recibido por Pagos (${((totales_generales.pagos_total / (totales_generales.pagos_total + totales_generales.gastos_total)) * 100).toFixed(1)}%)`,
        `Dinero Perdido por Gastos (${((totales_generales.gastos_total / (totales_generales.pagos_total + totales_generales.gastos_total)) * 100).toFixed(1)}%)`
      ],
      datasets: [
        {
          data: [totales_generales.pagos_total, totales_generales.gastos_total],
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label.includes('Dinero')) {
              return context.dataset.label + ': $' + formatCurrency(context.parsed.y);
            }
            return context.dataset.label + ': ' + context.parsed.y;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value;
          }
        }
      }
    }
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

  const downloadPDF = async () => {
    if (!reportData || !reportRef.current) return;

    const doc = new jsPDF();
    doc.text(`Reporte de Rutas - ${formatDate(reportData.fecha)}`, 20, 20);

    // Summary
    doc.text(`Fecha: ${formatDate(reportData.fecha)}`, 20, 30);
    doc.text(`Total Asesores: ${reportData.asesores.length}`, 20, 40);
    doc.text(`Total Dinero Recibido: $${formatCurrency(reportData.totales_generales.pagos_total)}`, 20, 50);
    doc.text(`Total Dinero Perdido: $${formatCurrency(reportData.totales_generales.gastos_total)}`, 20, 60);

    let yPosition = 75;

    // Charts
    if (chartRef1.current) {
      const canvas1 = await html2canvas(chartRef1.current);
      const imgData1 = canvas1.toDataURL('image/png');
      doc.addImage(imgData1, 'PNG', 20, yPosition, 170, 60);
      yPosition += 70;
    }

    if (chartRef2.current) {
      const canvas2 = await html2canvas(chartRef2.current);
      const imgData2 = canvas2.toDataURL('image/png');
      doc.addImage(imgData2, 'PNG', 20, yPosition, 170, 60);
      yPosition += 70;
    }

    if (chartRef3.current) {
      const canvas3 = await html2canvas(chartRef3.current);
      const imgData3 = canvas3.toDataURL('image/png');
      doc.addImage(imgData3, 'PNG', 20, yPosition, 170, 60);
      yPosition += 70;
    }

    // Table
    const tableRows = reportData.asesores.map(asesor => [
      asesor.nombre,
      asesor.ventas.cantidad,
      asesor.gastos.cantidad,
      asesor.entregas.completadas,
      asesor.entregas.pendientes,
      `$${formatCurrency(asesor.pagos.monto)}`,
      `$${formatCurrency(asesor.gastos.monto)}`
    ]);

    autoTable(doc, {
      head: [['Asesor', 'Ventas', 'Gastos', 'Entregas Comp.', 'Entregas Pend.', 'Pagos Recibidos', 'Gastos Monto']],
      body: tableRows,
      startY: yPosition,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'right' }
      }
    });

    doc.save(`reporte_rutas_${reportData.fecha}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Reporte de Rutas</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Día</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-lg p-2 w-full"
              />
            </div>

            <div></div> {/* Empty space for alignment */}

            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedDate}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg p-2 h-10 mt-6"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>

          {reportData && (
            <div ref={reportRef}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Día: {formatDate(reportData.fecha)}</h2>
              </div>

              {/* First Bar Chart - Quantities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Estadísticas de Cantidad por Asesor</h3>
                <div className="h-96" ref={chartRef1}>
                  <Bar data={prepareQuantityChartData()} options={chartOptions} />
                </div>
              </div>

              {/* Second Bar Chart - Amounts */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Estadísticas de Monto por Asesor</h3>
                <div className="h-96" ref={chartRef2}>
                  <Bar data={prepareAmountChartData()} options={chartOptions} />
                </div>
              </div>

              {/* Pie Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Distribución General de Dinero</h3>
                <div className="h-96 flex justify-center" ref={chartRef3}>
                  <div className="w-96">
                    <Pie data={preparePieChartData()} options={pieChartOptions} />
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-900">Total Pagos Recibidos</h3>
                  <p className="text-2xl font-bold text-green-700">
                    ${formatCurrency(reportData.totales_generales.pagos_total)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900">Total Gastos</h3>
                  <p className="text-2xl font-bold text-red-700">
                    ${formatCurrency(reportData.totales_generales.gastos_total)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-900">Utilidad Neta</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    ${formatCurrency(reportData.totales_generales.pagos_total - reportData.totales_generales.gastos_total)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-yellow-900">Total Asesores</h3>
                  <p className="text-2xl font-bold text-yellow-700">
                    {reportData.asesores.length}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">Detalle por Asesor</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Asesor</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Ventas</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Gastos</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Entregas Comp.</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Entregas Pend.</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Pagos Recibidos</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Monto Gastos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.asesores.map((asesor, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2">{asesor.nombre}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{asesor.ventas.cantidad}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{asesor.gastos.cantidad}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-green-600 font-medium">{asesor.entregas.completadas}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-yellow-600 font-medium">{asesor.entregas.pendientes}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-green-600 font-medium">
                            ${formatCurrency(asesor.pagos.monto)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-red-600 font-medium">
                            ${formatCurrency(asesor.gastos.monto)}
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
              Seleccione una fecha para generar el reporte
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RutasReport;