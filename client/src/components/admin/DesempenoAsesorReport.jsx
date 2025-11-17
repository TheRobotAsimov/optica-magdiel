import { useState, useEffect, useRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
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

  // Update dates when period changes
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
    
    // ✅ Convert strings to numbers during merge
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
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
        {
          label: 'Gastos de Ruta',
          data: mergedData.gastos,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
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
    if (!reportData || !mergedData) return;

    const doc = new jsPDF();
    doc.text(`Reporte de Desempeño - ${reportData.asesor.nombre}`, 20, 20);
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 30);

    // ✅ Convert totals to numbers
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
      head: [['Fecha', 'Ventas', 'Gastos de Ruta']],
      body: tableRows,
      startY: 195,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });

    doc.save(`reporte_desempeno_${reportData.asesor.nombre}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Reporte de Desempeño por Asesor</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedAsesor}
              onChange={(e) => setSelectedAsesor(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="">Seleccionar Asesor</option>
              {asesores.map(asesor => (
                <option key={asesor.idempleado} value={asesor.idempleado}>
                  {asesor.nombre} {asesor.paterno}
                </option>
              ))}
            </select>

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

            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedAsesor || !selectedPeriod}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg p-2"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>

          {reportData && mergedData && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Asesor: {reportData.asesor.nombre}</h2>
                <p className="text-gray-600">Rango de fechas: {fechaInicio} - {fechaFin}</p>
              </div>

              {/* ✅ Convert totals to numbers before using toFixed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-900">Total Ventas</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    ${formatCurrency(reportData.totales.ventas)}
                  </p>
                  <p className="text-sm text-blue-600">
                    Prom/día: ${formatCurrency(reportData.promedios.ventasPorDia)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h3 className="font-semibold text-red-900">Total Gastos de Ruta</h3>
                  <p className="text-2xl font-bold text-red-700">
                    ${formatCurrency(reportData.totales.gastos)}
                  </p>
                  <p className="text-sm text-red-600">
                    Prom/día: ${formatCurrency(reportData.promedios.gastosPorDia)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-semibold text-green-900">Utilidad Neta</h3>
                  <p className="text-2xl font-bold text-green-700">
                    ${formatCurrency(toNumber(reportData.totales.ventas) - toNumber(reportData.totales.gastos))}
                  </p>
                  <p className="text-sm text-green-600">
                    Prom/día: ${formatCurrency(toNumber(reportData.promedios.ventasPorDia) - toNumber(reportData.promedios.gastosPorDia))}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Gráfico de Desempeño</h3>
                <div className="h-96" ref={chartRef}>
                  <Bar data={prepareChartData()} options={chartOptions} />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-3xl font-semibold mb-3 text-center">Detalle Diario</h3>
                <div className="overflow-x-auto max-w-3xl mx-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Ventas</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Gastos de Ruta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mergedData.tableData.map((row, idx) => {
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2">{formatDate(row.date)}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right text-blue-600 font-medium">
                              ${formatCurrency(row.ventas)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right text-red-600 font-medium">
                              ${formatCurrency(row.gastos)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-2 font-semibold"
              >
                  Descargar PDF
              </button>
            </>
          )}

          {!reportData && !loading && (
            <div className="text-center text-gray-500 py-8">
              Seleccione un asesor y periodo para generar el reporte
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesempenoAsesorReport;