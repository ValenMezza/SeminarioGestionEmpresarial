const { listTransacciones, filtrarTransacciones } = require('../store/dbTransacciones');

const TIPOS = ['Alquiler', 'Venta Cantera', 'Venta Viaje'];

const transaccionesController = {
    index: async (req, res) => {
        const { id, tipo, cliente, fechaDesde, fechaHasta, montoMin, montoMax } = req.query;
        const tienesFiltros = id || tipo || cliente || fechaDesde || fechaHasta || montoMin || montoMax;
        const transacciones = tienesFiltros
            ? await filtrarTransacciones({ id, tipo, cliente, fechaDesde, fechaHasta, montoMin, montoMax })
            : await listTransacciones();
        const filtros = { id: id || '', tipo: tipo || '', cliente: cliente || '', fechaDesde: fechaDesde || '', fechaHasta: fechaHasta || '', montoMin: montoMin || '', montoMax: montoMax || '' };
        res.render('transacciones/index', { transacciones, filtros, tipos: TIPOS });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const transacciones = await listTransacciones();
        const transaccion = transacciones.find(t => t.id === id);
        if (!transaccion) return res.status(404).send('Transacción no encontrada');
        res.render('transacciones/detalle', { transaccion });
    }
};

module.exports = transaccionesController;
