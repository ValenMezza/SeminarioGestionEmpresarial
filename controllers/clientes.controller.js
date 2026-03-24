const { listClientes, clienteById, crearCliente, eliminarCliente } = require('../store/dbClientes');
const { listContenedores } = require('../store/dbContenedor');

const clienteController = {
    index: (req, res) => {
        const clientes = listClientes();
        res.render('clientes/index', { clientes });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = clienteById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');

        const contenedores = await listContenedores();
        const alquileres = contenedores.filter(c => c.cliente === cliente.nombre);
        res.render('clientes/detalle', { cliente, alquileres });
    },

    cuentas: (req, res) => {
        res.render('clientes/cuentas');
    },

    nuevo: (req, res) => {
        res.render('clientes/nuevo_cliente');
    },

    crearCliente: (req, res) => {
        const { nombre, telefono, email, direccion } = req.body;
        crearCliente({ nombre, telefono, email, direccion });
        res.redirect('/clientes');
    },

    eliminar: (req, res) => {
        const id = Number(req.params.id);
        eliminarCliente(id);
        res.redirect('/clientes');
    }
};

module.exports = clienteController;
