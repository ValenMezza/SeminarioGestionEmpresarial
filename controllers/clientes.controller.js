const { listClientes, clienteById, buscarClientes, crearCliente, editarCliente, eliminarCliente, habilitarCuentaCorriente, clientesConCuenta, clientesSinCuenta } = require('../store/dbClientes');
const { listContenedores } = require('../store/dbContenedor');
const { listTransacciones } = require('../store/dbTransacciones');

const clienteController = {
    index: (req, res) => {
        const { nombre, telefono } = req.query;
        const clientes = buscarClientes({ nombre, telefono });
        res.render('clientes/index', { clientes, filtros: { nombre: nombre || '', telefono: telefono || '' } });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = clienteById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');

        const { fechaDesde, fechaHasta, tipoOp } = req.query;

        const contenedores  = await listContenedores();
        let alquileres      = contenedores.filter(c => c.cliente === cliente.nombre);
        const transacciones = listTransacciones().filter(t => t.cliente === cliente.nombre);

        // Filtros
        if (fechaDesde) {
            alquileres = alquileres.filter(a => a.inicioAlquiler && a.inicioAlquiler >= fechaDesde);
        }
        if (fechaHasta) {
            alquileres = alquileres.filter(a => a.inicioAlquiler && a.inicioAlquiler <= fechaHasta);
        }

        const filtros = { fechaDesde: fechaDesde || '', fechaHasta: fechaHasta || '', tipoOp: tipoOp || '' };

        res.render('clientes/detalle', { cliente, alquileres, transacciones, filtros });
    },

    cuentas: (req, res) => {
        const conCuenta    = clientesConCuenta();
        const sinCuenta    = clientesSinCuenta();
        res.render('clientes/cuentas', { conCuenta, sinCuenta });
    },

    nuevo: (req, res) => {
        res.render('clientes/nuevo_cliente');
    },

    crearCliente: (req, res) => {
        const { nombre, telefono, email, direccion, cuentaCorriente } = req.body;
        crearCliente({ nombre, telefono, email, direccion, cuentaCorriente });
        res.redirect('/clientes');
    },

    editar: (req, res) => {
        const id = Number(req.params.id);
        const cliente = clienteById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');
        res.render('clientes/editar', { cliente, error: null });
    },

    guardarEdicion: (req, res) => {
        const id = Number(req.params.id);
        const { nombre, telefono, email, direccion, cuentaCorriente } = req.body;
        if (!nombre) {
            const cliente = clienteById(id);
            return res.render('clientes/editar', { cliente, error: 'El nombre es obligatorio.' });
        }
        editarCliente(id, { nombre, telefono, email, direccion, cuentaCorriente });
        res.redirect(`/clientes/detalle/${id}`);
    },

    eliminar: (req, res) => {
        const id = Number(req.params.id);
        eliminarCliente(id);
        res.redirect('/clientes');
    },

    habilitarCuenta: (req, res) => {
        const id = Number(req.params.id);
        habilitarCuentaCorriente(id);
        res.redirect('/clientes/cuentas');
    }
};

module.exports = clienteController;
