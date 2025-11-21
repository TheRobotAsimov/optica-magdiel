import Pago from '../models/Pago.js';
import Venta from '../models/Venta.js';

export const getPagos = async (req, res) => {
  try {
    const pagos = await Pago.getAll();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingPagos = async (req, res) => {
  try {
    const pagos = await Pago.getPending();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ message: 'Pago not found' });
    res.json(pago);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPago = async (req, res) => {
  try {
    const { folio, cantidad } = req.body;
    const montoPago = parseFloat(cantidad);

    // 1. Obtener la venta para validar
    // Asumimos que Venta.findById o getVentaByFolio existe
    const venta = await Venta.findByFolio(folio); // O findById según tu modelo
    
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    const porPagar = parseFloat(venta.total) - parseFloat(venta.pagado || 0);

    // 2. Validar que no pague de más (permitimos un pequeño margen por decimales)
    if (montoPago > porPagar + 0.1) {
      return res.status(400).json({ 
        message: `El monto excede el adeudo. Restan: $${porPagar.toFixed(2)}` 
      });
    }

    // 3. Crear el pago
    const newPago = await Pago.create(req.body);

    // 4. Actualizar la venta sumando el nuevo pago
    const nuevoPagado = parseFloat(venta.pagado || 0) + montoPago;
    
    // Determinar si actualizar estatus de venta a 'Pagado' o 'Pendiente'
    // Esto es opcional, pero recomendado
    const nuevoEstatusVenta = nuevoPagado >= parseFloat(venta.total) - 0.1 ? 'Pagado' : venta.estatus;

    await Venta.update(folio, { 
      pagado: nuevoPagado,
      estatus: nuevoEstatusVenta 
    });

    res.status(201).json(newPago);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePago = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body; // Nueva cantidad
    const nuevoMonto = parseFloat(cantidad);

    // 1. Obtener el pago ANTERIOR para saber la diferencia
    const pagoAnterior = await Pago.findById(id);
    if (!pagoAnterior) return res.status(404).json({ message: 'Pago no encontrado' });

    const venta = await Venta.findByFolio(pagoAnterior.folio);
    
    // Calcular la diferencia: Si antes pagó 100 y ahora 150, diferencia es +50
    const diferencia = nuevoMonto - parseFloat(pagoAnterior.cantidad);
    const nuevoTotalPagadoVenta = parseFloat(venta.pagado) + diferencia;

    // 2. Validar que la modificación no exceda el total de la venta
    if (nuevoTotalPagadoVenta > parseFloat(venta.total) + 0.1) {
       return res.status(400).json({ 
        message: `La modificación excede el total de la venta.` 
      });
    }

    // 3. Actualizar Pago
    const updatedPago = await Pago.update(id, req.body);

    // 4. Actualizar Venta
    await Venta.update(venta.folio, { pagado: nuevoTotalPagadoVenta });

    res.json(updatedPago);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deletePago = async (req, res) => {
  try {
    // 1. Obtenemos el pago antes de borrarlo para saber cuánto restar
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ message: 'Pago not found' });

    // 2. Buscamos la venta asociada
    const venta = await Venta.findByFolio(pago.folio);

    if (venta) {
      // 3. Calculamos el nuevo 'pagado' (restando lo que se va a borrar)
      const montoEliminado = parseFloat(pago.cantidad);
      let nuevoPagado = parseFloat(venta.pagado || 0) - montoEliminado;

      // Evitar números negativos por seguridad
      if (nuevoPagado < 0) nuevoPagado = 0;

      // 4. Si la venta estaba "Pagada" pero ahora debe dinero, la regresamos a "Pendiente"
      let nuevoEstatus = venta.estatus;
      if (nuevoPagado < parseFloat(venta.total) - 0.1) {
        nuevoEstatus = 'Pendiente'; 
      }

      // Actualizamos la venta
      await Venta.update(venta.folio, { 
        pagado: nuevoPagado,
        estatus: nuevoEstatus
      });
    }

    // 5. Finalmente borramos el pago
    await Pago.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
