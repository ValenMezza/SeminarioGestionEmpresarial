const { listProds }                      = require('../store/dbStock');
const { listClientes }                   = require('../store/dbClientes');
const { listContenedoresDisponibles, actualizarContenedor } = require('../store/dbContenedor');
const { crearTransaccion }               = require('../store/dbTransacciones');

const ventasController = {
    index: async (req, res) => {
        const productos         = await listProds();
        const clientes          = listClientes();
        const contenedoresLibres = await listContenedoresDisponibles();
        res.render('ventas/index', { productos, clientes, contenedoresLibres });
    },

    finalizarVentaCantera: (req, res) => {
        const { tipoCliente, clienteExistente, nombreParticular, telefonoParticular, items } = req.body;

        let nombreCliente;
        if (tipoCliente === 'particular') {
            nombreCliente = nombreParticular || 'Particular';
        } else {
            nombreCliente = clienteExistente || 'Sin nombre';
        }

        let carrito = [];
        try { carrito = JSON.parse(items || '[]'); } catch (_) {}

        const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const desc  = carrito.map(p => `${p.nombre} x${p.cantidad}`).join(', ');

        crearTransaccion({
            tipo: 'Venta Cantera',
            cliente: nombreCliente,
            monto: total,
            descripcion: desc
        });

        res.redirect('/ventas');
    },

    finalizarVentaViaje: async (req, res) => {
        const { clienteNombre, contenedor: contenedorId, fechaInicio, fechaFin, calle, numero, items } = req.body;

        let carrito = [];
        try { carrito = JSON.parse(items || '[]'); } catch (_) {}

        const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const desc  = carrito.map(p => `${p.nombre} x${p.cantidad}`).join(', ');

        if (contenedorId) {
            actualizarContenedor(Number(contenedorId), {
                estado: 'Alquilado',
                cliente: clienteNombre,
                inicioAlquiler: fechaInicio,
                finAlquiler: fechaFin,
                direccionAlquiler: `${calle} ${numero}`
            });
        }

        crearTransaccion({
            tipo: 'Venta Viaje',
            cliente: clienteNombre,
            monto: total,
            descripcion: `${desc} — ${calle} ${numero}`
        });

        res.redirect('/ventas');
    }
};

module.exports = ventasController;
