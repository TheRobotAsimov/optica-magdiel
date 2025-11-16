import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import reporteService from '../../service/reporteService';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DesempenoAsesorReport = () => {
  const [asesores, setAsesores] = useState([]);
  const [selectedAsesor, setSelectedAsesor] = useState('');
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

  const prepareChartData = () => {
    if (!reportData) return null;

    const labels = reportData.ventasDiarias.map(v => v.fecha.split('T')[0]);
    return {
      labels,
      datasets: [
        {
          label: 'Ventas',
          data: reportData.ventasDiarias.map(v => v.total_ventas),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Gastos',
          data: reportData.gastosDiarios.map(g => g.total_gastos),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    doc.text(`Reporte de Desempeño - ${reportData.asesor.nombre}`, 20, 20);
    doc.text(`Rango de fechas: ${fechaInicio} - ${fechaFin}`, 20, 30);

    // Agregar totales y promedios
    doc.text(`Total Ventas: $${reportData.totales.ventas}`, 20, 45);
    doc.text(`Total Gastos: $${reportData.totales.gastos}`, 20, 55);
    doc.text(`Promedio Ventas por Día: $${reportData.promedios.ventasPorDia.toFixed(2)}`, 20, 65);
    doc.text(`Promedio Gastos por Día: $${reportData.promedios.gastosPorDia.toFixed(2)}`, 20, 75);

    // Capturar la gráfica como imagen
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 85, 170, 80);
    }

    // Agregar tabla con datos
    const tableData = reportData.ventasDiarias.map((v, index) => [
      v.fecha.split('T')[0], // Solo fecha sin hora
      v.total_ventas,
      reportData.gastosDiarios[index]?.total_gastos || 0
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Ventas', 'Gastos']],
      body: tableData,
      startY: 175,
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

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border rounded-lg p-2"
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border rounded-lg p-2"
            />

            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>

          {reportData && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Asesor: {reportData.asesor.nombre}</h2>
                <p>Rango de fechas: {fechaInicio} - {fechaFin}</p>
              </div>

              <div className="mb-6" ref={chartRef}>
                <Bar data={prepareChartData()} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold">Total Ventas: ${reportData.totales.ventas}</h3>
                  <p>Promedio diario: ${reportData.promedios.ventasPorDia.toFixed(2)}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold">Total Gastos: ${reportData.totales.gastos}</h3>
                  <p>Promedio diario: ${reportData.promedios.gastosPorDia.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
              >
                Descargar PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesempenoAsesorReport;