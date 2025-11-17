import pool from '../config/db.js';
import Venta from '../models/Venta.js';
import GastoRuta from '../models/GastoRuta.js';
import Empleado from '../models/Empleado.js';
import Pago from '../models/Pago.js';

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

export const getPagosClientes = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    console.log('Fecha inicio:', fechaInicio, 'Fecha fin:', fechaFin);

    // Obtener todos los pagos
    const pagos = await Pago.getAll();
    console.log('Total pagos en BD:', pagos.length);

    // Filtrar pagos por rango de fechas
    const pagosEnRango = pagos.filter(p => {
      // Handle different date formats
      let pagoFecha;
      if (typeof p.fecha === 'string' && p.fecha.includes('T')) {
        pagoFecha = p.fecha.split('T')[0];
      } else if (p.fecha instanceof Date) {
        pagoFecha = p.fecha.toISOString().split('T')[0];
      } else {
        pagoFecha = p.fecha; // Assume it's already in YYYY-MM-DD format
      }

      const inRange = pagoFecha >= fechaInicio && pagoFecha <= fechaFin;
      //console.log('Pago:', p.idpago, 'Fecha BD:', p.fecha, 'Fecha filtrada:', pagoFecha, 'Rango:', fechaInicio, 'to', fechaFin, 'En rango:', inRange);
      return inRange;
    });

    //console.log('Pagos en rango:', pagosEnRango.length);

    // Agrupar pagos por cliente
    const clientesData = {};

    for (const pago of pagosEnRango) {
      const clienteKey = pago.cliente_nombre + ' ' + pago.cliente_paterno;

      if (!clientesData[clienteKey]) {
        clientesData[clienteKey] = {
          nombreCliente: clienteKey,
          pagosCompletados: 0,
          pagosAtrasados: 0,
          montoCompletados: 0,
          montoAtrasados: 0,
          totalPagos: 0,
          totalMonto: 0
        };
      }

      clientesData[clienteKey].totalPagos++;
      clientesData[clienteKey].totalMonto += parseFloat(pago.cantidad);

      if (pago.estatus === 'Pagado') {
        clientesData[clienteKey].pagosCompletados++;
        clientesData[clienteKey].montoCompletados += parseFloat(pago.cantidad);
      } else if (pago.estatus === 'Pendiente') {
        clientesData[clienteKey].pagosAtrasados++;
        clientesData[clienteKey].montoAtrasados += parseFloat(pago.cantidad);
      }
    }

    // Calcular estadísticas globales
    let totalPagosCompletados = 0;
    let totalPagosAtrasados = 0;
    let totalMontoCompletados = 0;
    let totalMontoAtrasados = 0;

    const clientesMorosos = [];

    for (const [clienteNombre, data] of Object.entries(clientesData)) {
      totalPagosCompletados += data.pagosCompletados;
      totalPagosAtrasados += data.pagosAtrasados;
      totalMontoCompletados += data.montoCompletados;
      totalMontoAtrasados += data.montoAtrasados;

      // Calcular índice de morosidad para clientes con pagos atrasados
      if (data.pagosAtrasados > 0) {
        // Obtener información de la venta para calcular días de atraso
        try {
          // Buscar la venta relacionada con este cliente
          const ventaInfo = await pool.execute(`
            SELECT v.fecha, v.total
            FROM venta v
            JOIN cliente c ON v.idcliente = c.idcliente
            WHERE CONCAT(c.nombre, ' ', c.paterno) = ?
            ORDER BY v.fecha DESC
            LIMIT 1
          `, [clienteNombre]);

          if (ventaInfo[0].length > 0) {
            const venta = ventaInfo[0][0];
            const fechaVenta = new Date(venta.fecha);
            const diasAtraso = Math.floor((new Date() - fechaVenta) / (1000 * 60 * 60 * 24));
            const indiceMorosidad = parseFloat(venta.total) * Math.max(1, diasAtraso);

            clientesMorosos.push({
              nombreCliente: clienteNombre,
              monto: parseFloat(venta.total),
              fechaVenta: venta.fecha,
              diasAtraso,
              indiceMorosidad,
              pagosAtrasados: data.pagosAtrasados,
              montoAtrasados: data.montoAtrasados
            });
          }
        } catch (error) {
          console.log('Error obteniendo info de venta para cliente:', clienteNombre, error);
        }
      }
    }

    // Ordenar clientes por índice de morosidad (más alto primero)
    clientesMorosos.sort((a, b) => b.indiceMorosidad - a.indiceMorosidad);

    // Tomar top 10 clientes más morosos
    const topClientesMorosos = clientesMorosos.slice(0, 10);

    const totalPagos = totalPagosCompletados + totalPagosAtrasados;
    const totalMonto = totalMontoCompletados + totalMontoAtrasados;

    res.json({
      rangoFechas: { inicio: fechaInicio, fin: fechaFin },
      estadisticasPagos: {
        completados: {
          cantidad: totalPagosCompletados,
          monto: totalMontoCompletados,
          porcentaje: totalPagos > 0 ? (totalPagosCompletados / totalPagos * 100) : 0
        },
        atrasados: {
          cantidad: totalPagosAtrasados,
          monto: totalMontoAtrasados,
          porcentaje: totalPagos > 0 ? (totalPagosAtrasados / totalPagos * 100) : 0
        },
        total: {
          cantidad: totalPagos,
          monto: totalMonto
        }
      },
      clientesMorosos: topClientesMorosos
    });
  } catch (error) {
    console.error('Error en getPagosClientes:', error);
    res.status(500).json({ error: error.message });
  }
};