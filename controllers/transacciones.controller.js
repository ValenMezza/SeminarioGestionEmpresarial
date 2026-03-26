const { listTransacciones } = require('../store/dbTransacciones');

const transaccionesController = {
    index: (req, res) => {
        const transacciones = listTransacciones();
        res.render('transacciones/index', { transacciones });
    },
    detalle: (req, res) => {
        const transacciones = listTransacciones();
        const id = Number(req.params.id);
        const transaccion = transacciones.find(t => t.id === id);
        if (!transaccion) return res.status(404).send('Transacción no encontrada');
        res.render('transacciones/detalle', { transaccion });
    }
}

module.exports = transaccionesController;