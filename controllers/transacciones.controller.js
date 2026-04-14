const { listTransacciones, filtrarTransacciones } = require('../store/dbTransacciones');

const TIPOS = ['Alquiler', 'Venta Cantera', 'Venta Viaje'];

const transaccionesController = {
    index: async (req, res) => {
        const { id, tipo, idCliente, cliente, fechaDesde, fechaHasta, montoMin, montoMax, mes } = req.query;
        // Si se filtra por mes (formato YYYY-MM), derivar fechaDesde/fechaHasta
        let fDesde = fechaDesde, fHasta = fechaHasta;
        if (mes && /^\d{4}-\d{2}$/.test(mes)) {
            const [anio, mm] = mes.split('-').map(Number);
            const ultimoDia = new Date(anio, mm, 0).getDate();
            fDesde = `${mes}-01`;
            fHasta = `${mes}-${String(ultimoDia).padStart(2, '0')}`;
        }
        const tienesFiltros = id || tipo || idCliente || cliente || fDesde || fHasta || montoMin || montoMax;
        const transacciones = tienesFiltros
            ? await filtrarTransacciones({ id, tipo, idCliente, cliente, fechaDesde: fDesde, fechaHasta: fHasta, montoMin, montoMax })
            : await listTransacciones();
        const totalMes = transacciones.reduce((acc, t) => acc + (t.monto || 0), 0);
        const filtros = { id: id || '', tipo: tipo || '', idCliente: idCliente || '', cliente: cliente || '', fechaDesde: fechaDesde || '', fechaHasta: fechaHasta || '', montoMin: montoMin || '', montoMax: montoMax || '', mes: mes || '' };
        res.render('transacciones/index', { transacciones, filtros, tipos: TIPOS, totalMes });
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
