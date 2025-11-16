import Venta from '../models/Venta.js';
import GastoRuta from '../models/GastoRuta.js';
import Empleado from '../models/Empleado.js';

export const getDesempenoAsesor = async (req, res) => {
  try {
    const { idasesor, fechaInicio, fechaFin } = req.query;

    // Obtener datos del asesor
    const asesor = await Empleado.getById(idasesor);
    if (!asesor) {
      return res.status(404).json({ message: 'Asesor no encontrado' });
    }

    // Obtener ventas agregadas por día
    const ventasDiarias = await Venta.getVentasAggregatedByAsesorAndDateRange(idasesor, fechaInicio, fechaFin);

    // Obtener gastos agregados por día
    const gastosDiarios = await GastoRuta.getGastosAggregatedByAsesorAndDateRange(idasesor, fechaInicio, fechaFin);

    // Obtener totales
    const totalesVentas = await Venta.getTotalVentasByAsesorAndDateRange(idasesor, fechaInicio, fechaFin);
    const totalesGastos = await GastoRuta.getTotalGastosByAsesorAndDateRange(idasesor, fechaInicio, fechaFin);

    // Calcular promedios
    const dias = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
    const promedioVentas = totalesVentas.total_ventas / dias;
    const promedioGastos = totalesGastos.total_gastos / dias;

    res.json({
      asesor: {
        nombre: `${asesor.nombre} ${asesor.paterno} ${asesor.materno || ''}`.trim(),
        id: asesor.idempleado
      },
      rangoFechas: { inicio: fechaInicio, fin: fechaFin },
      ventasDiarias,
      gastosDiarios,
      totales: {
        ventas: totalesVentas.total_ventas || 0,
        gastos: totalesGastos.total_gastos || 0,
        numeroVentas: totalesVentas.numero_ventas || 0
      },
      promedios: {
        ventasPorDia: promedioVentas || 0,
        gastosPorDia: promedioGastos || 0
      }
    });
  } catch (error) {
    console.log(req.query);
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};