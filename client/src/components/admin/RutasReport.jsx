import { useState, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { BarChart3, Download, Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
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
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Gastos Realizados',
          data: reportData.asesores.map(asesor => asesor.gastos.cantidad),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Entregas Completadas',
          data: reportData.asesores.map(asesor => asesor.entregas.completadas),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Entregas Pendientes',
          data: reportData.asesores.map(asesor => asesor.entregas.pendientes),
          backgroundColor: 'rgba(234, 179, 8, 0.8)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 2,
          borderRadius: 6,
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
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Dinero Perdido por Gastos',
          data: reportData.asesores.map(asesor => asesor.gastos.monto),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  };

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!reportData) return null;

    const { totales_generales } = reportData;
    const total = totales_generales.pagos_total + totales_generales.gastos_total;
    const pagosPercent = total > 0 ? ((totales_generales.pagos_total / total) * 100).toFixed(1) : 0;
    const gastosPercent = total > 0 ? ((totales_generales.gastos_total / total) * 100).toFixed(1) : 0;

    return {
      labels: [
        `Dinero Recibido por Pagos (${pagosPercent}%)`,
        `Dinero Perdido por Gastos (${gastosPercent}%)`
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 12, weight: '500' },
          callback: function(value) {
            return value;
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

  const downloadPDF = async () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Reporte de Rutas - ${formatDate(reportData.fecha)}`, 20, 20);
    
    // Summary section
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${formatDate(reportData.fecha)}`, 20, 32);
    doc.text(`Total Asesores: ${reportData.asesores.length}`, 20, 40);
    doc.text(`Total Dinero Recibido: $${formatCurrency(reportData.totales_generales.pagos_total)}`, 20, 48);
    doc.text(`Total Dinero Perdido: $${formatCurrency(reportData.totales_generales.gastos_total)}`, 20, 56);
    doc.text(`Utilidad Neta: $${formatCurrency(reportData.totales_generales.pagos_total - reportData.totales_generales.gastos_total)}`, 20, 64);

    let yPosition = 75;

    // Chart 1: Quantities
    if (chartRef1.current) {
      try {
        const canvas1 = await html2canvas(chartRef1.current, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const imgData1 = canvas1.toDataURL('image/png');
        doc.addImage(imgData1, 'PNG', 15, yPosition, 180, 70);
        yPosition += 78;
      } catch (error) {
        console.error('Error capturing chart 1:', error);
      }
    }

    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Chart 2: Amounts
    if (chartRef2.current) {
      try {
        const canvas2 = await html2canvas(chartRef2.current, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const imgData2 = canvas2.toDataURL('image/png');
        doc.addImage(imgData2, 'PNG', 15, yPosition, 180, 70);
        yPosition += 78;
      } catch (error) {
        console.error('Error capturing chart 2:', error);
      }
    }

    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Chart 3: Pie chart
    if (chartRef3.current) {
      try {
        const canvas3 = await html2canvas(chartRef3.current, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const imgData3 = canvas3.toDataURL('image/png');
        const imgWidth = 300; 
        const xPos = -50; // Centramos la grafica

        const imgHeight = (canvas3.height * imgWidth) / canvas3.width;
        doc.addImage(imgData3, 'PNG', xPos, yPosition, imgWidth, imgHeight);
        yPosition += 78;
      } catch (error) {
        console.error('Error capturing chart 3:', error);
      }
    }

    // Add new page for table
    doc.addPage();
    yPosition = 20;

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
        0: { halign: 'left', cellWidth: 35 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 35 },
        6: { halign: 'right', cellWidth: 30 }
      }
    });

    doc.save(`reporte_rutas_${reportData.fecha}.pdf`);
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
                  <h1 className="text-3xl font-bold text-white">Reporte de Rutas</h1>
                  <p className="text-blue-100 text-sm mt-1">Análisis de desempeño por asesor del día</p>
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
              Selección de Fecha
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                  Día
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium bg-white hover:border-gray-300"
                />
              </div>

              <div></div>

              <div className="group">
                <label className="text-sm font-semibold text-gray-700 mb-2 block opacity-0">Action</label>
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedDate}
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
          <>
            {/* Date Info */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{formatDate(reportData.fecha)}</h2>
                    <p className="text-gray-600 text-sm">Reporte del día seleccionado</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-green-900 text-lg">Total Pagos Recibidos</h3>
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    ${formatCurrency(reportData.totales_generales.pagos_total)}
                  </p>
                </div>
              </div>

              
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-red-900 text-lg">Total Gastos</h3>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    ${formatCurrency(reportData.totales_generales.gastos_total)}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-900 text-lg">Utilidad Neta</h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    ${formatCurrency(reportData.totales_generales.pagos_total - reportData.totales_generales.gastos_total)}
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-yellow-900 text-lg">Total Asesores</h3>
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-yellow-700">
                    {reportData.asesores.length}
                  </p>
                </div>
              </div>
            </div>

            {/* First Bar Chart - Quantities */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Estadísticas de Cantidad por Asesor
                </h3>
              </div>
              <div className="p-6">
                <div className="h-96" ref={chartRef1}>
                  <Bar data={prepareQuantityChartData()} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Second Bar Chart - Amounts */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Estadísticas de Monto por Asesor
                </h3>
              </div>
              <div className="p-6">
                <div className="h-96" ref={chartRef2}>
                  <Bar data={prepareAmountChartData()} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Distribución General de Dinero
                </h3>
              </div>
              <div className="p-6">
                <div className="h-96 flex justify-center" ref={chartRef3}>
                  <div className="w-full max-w-md">
                    <Pie data={preparePieChartData()} options={pieChartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Detalle por Asesor
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Asesor</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Ventas</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Gastos</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Entregas Comp.</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Entregas Pend.</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Pagos Recibidos</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Monto Gastos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.asesores.map((asesor, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                            {asesor.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-blue-600">
                            {asesor.ventas.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            {asesor.gastos.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-green-600">
                            {asesor.entregas.completadas}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-yellow-600">
                            {asesor.entregas.pendientes}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-green-600">
                            ${formatCurrency(asesor.pagos.monto)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            ${formatCurrency(asesor.gastos.monto)}
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
                Seleccione una fecha para generar el reporte
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RutasReport;