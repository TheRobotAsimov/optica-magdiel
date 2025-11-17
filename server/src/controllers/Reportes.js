import pool from '../config/db.js';
import Venta from '../models/Venta.js';
import GastoRuta from '../models/GastoRuta.js';
import Empleado from '../models/Empleado.js';
import Pago from '../models/Pago.js';
import Entrega from '../models/Entrega.js';

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

export const getRutasReport = async (req, res) => {
 try {
   const { fecha } = req.query;

   if (!fecha) {
     return res.status(400).json({ message: 'Fecha es requerida' });
   }

   // Obtener todos los asesores
   const asesores = await Empleado.getByPuesto('Asesor');

   const reportData = [];

   // Para cada asesor, calcular estadísticas del día
   for (const asesor of asesores) {
     // Ventas del día
     const ventasDia = await pool.execute(`
       SELECT COUNT(*) as cantidad_ventas, SUM(total) as monto_ventas
       FROM venta
       WHERE idasesor = ? AND DATE(fecha) = ?
     `, [asesor.idempleado, fecha]);

     // Gastos del día (a través de rutas)
     const gastosDia = await pool.execute(`
       SELECT SUM(g.cantidad) as monto_gastos, COUNT(*) as cantidad_gastos
       FROM gasto_ruta g
       JOIN ruta r ON g.idruta = r.idruta
       WHERE r.idasesor = ? AND DATE(r.fecha) = ?
     `, [asesor.idempleado, fecha]);

     // Entregas del día
     const entregasDia = await pool.execute(`
       SELECT
         SUM(CASE WHEN e.estatus = 'Entregado' THEN 1 ELSE 0 END) as entregas_completadas,
         SUM(CASE WHEN e.estatus != 'Entregado' THEN 1 ELSE 0 END) as entregas_pendientes
       FROM entrega e
       JOIN ruta r ON e.idruta = r.idruta
       WHERE r.idasesor = ? AND DATE(r.fecha) = ?
     `, [asesor.idempleado, fecha]);

     // Pagos recibidos del día
     const pagosDia = await pool.execute(`
       SELECT SUM(p.cantidad) as monto_pagos
       FROM pago p
       JOIN venta v ON p.folio = v.folio
       WHERE v.idasesor = ? AND DATE(p.fecha) = ? AND p.estatus = 'Pagado'
     `, [asesor.idempleado, fecha]);

     const asesorData = {
       idasesor: asesor.idempleado,
       nombre: `${asesor.nombre} ${asesor.paterno} ${asesor.materno || ''}`.trim(),
       ventas: {
         cantidad: parseInt(ventasDia[0][0].cantidad_ventas) || 0,
         monto: parseFloat(ventasDia[0][0].monto_ventas) || 0
       },
       gastos: {
         cantidad: parseInt(gastosDia[0][0].cantidad_gastos) || 0,
         monto: parseFloat(gastosDia[0][0].monto_gastos) || 0
       },
       entregas: {
         completadas: parseInt(entregasDia[0][0].entregas_completadas) || 0,
         pendientes: parseInt(entregasDia[0][0].entregas_pendientes) || 0
       },
       pagos: {
         monto: parseFloat(pagosDia[0][0].monto_pagos) || 0
       }
     };

     reportData.push(asesorData);
   }

   // Calcular totales generales para el gráfico circular
   const totalesGenerales = {
     pagos_total: reportData.reduce((sum, asesor) => sum + asesor.pagos.monto, 0),
     gastos_total: reportData.reduce((sum, asesor) => sum + asesor.gastos.monto, 0)
   };

   res.json({
     fecha,
     asesores: reportData,
     totales_generales: totalesGenerales
   });

 } catch (error) {
   console.error('Error en getRutasReport:', error);
   res.status(500).json({ error: error.message });
 }
};