const { listClientes, clienteById, buscarClientes, crearCliente, editarCliente, eliminarCliente, habilitarCuentaCorriente, abonarCuenta, clientesConCuenta, clientesSinCuenta, nombreCompleto } = require('../store/dbClientes');
const { listContenedores } = require('../store/dbContenedor');
const { listTransacciones } = require('../store/dbTransacciones');

const clienteController = {
    index: (req, res) => {
        const { nombre, dni, id } = req.query;
        let clientes;
        if (nombre || dni || id) {
            clientes = buscarClientes({ id, nombre, dni });
        } else {
            clientes = listClientes();
        }
        res.render('clientes/index', { clientes, filtros: { id: id || '', nombre: nombre || '', dni: dni || '' } });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = clienteById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');

        const { fechaDesde, fechaHasta, tipoOp } = req.query;

        const contenedores  = await listContenedores();
        const fullName = nombreCompleto(cliente);
        let alquileres      = contenedores.filter(c => c.clienteId === cliente.id || c.cliente === fullName);
        const transacciones = listTransacciones().filter(t => t.clienteId === cliente.id || t.cliente === fullName);

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
        const { nombre, apellido, dni, telefono, email, direccion, cuentaCorriente } = req.body;
        crearCliente({ nombre, apellido, dni, telefono, email, direccion, cuentaCorriente });
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
        const { nombre, apellido, dni, telefono, email, direccion, cuentaCorriente } = req.body;
        if (!nombre || !apellido) {
            const cliente = clienteById(id);
            return res.render('clientes/editar', { cliente, error: 'Nombre y apellido son obligatorios.' });
        }
        editarCliente(id, { nombre, apellido, dni, telefono, email, direccion, cuentaCorriente });
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
    },

    abonar: (req, res) => {
        const id = Number(req.params.id);
        const cliente = clienteById(id);
        if (!cliente || !cliente.cuentaCorriente) return res.redirect('/clientes/cuentas');
        const deuda = Math.abs(Math.min(cliente.saldo, 0)); // deuda real (positiva)
        let monto = Number(req.body.monto);
        if (!monto || monto <= 0) return res.redirect('/clientes/cuentas');
        if (monto > deuda) monto = deuda; // no puede exceder la deuda
        abonarCuenta(id, monto);
        res.redirect('/clientes/cuentas');
    },

    // API JSON endpoints
    buscarApi: (req, res) => {
        const { id, dni, nombre } = req.query;
        if (!id && !dni && !nombre) return res.json([]);
        const resultados = buscarClientes({ id, dni, nombre });
        res.json(resultados.map(c => ({
            id: c.id,
            nombre: c.nombre,
            apellido: c.apellido,
            nombreCompleto: nombreCompleto(c),
            dni: c.dni,
            telefono: c.telefono,
            email: c.email,
            cuentaCorriente: c.cuentaCorriente
        })));
    },

    crearApi: (req, res) => {
        const { nombre, apellido, dni, telefono, email } = req.body;
        if (!nombre || !apellido || !telefono) {
            return res.status(400).json({ error: 'Nombre, apellido y telefono son obligatorios' });
        }
        const nuevo = crearCliente({ nombre, apellido, dni, telefono, email });
        res.json({
            id: nuevo.id,
            nombre: nuevo.nombre,
            apellido: nuevo.apellido,
            nombreCompleto: nombreCompleto(nuevo),
            dni: nuevo.dni,
            telefono: nuevo.telefono,
            email: nuevo.email,
            cuentaCorriente: nuevo.cuentaCorriente
        });
    }
};

module.exports = clienteController;
