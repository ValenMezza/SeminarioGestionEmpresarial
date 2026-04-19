const { listClientes, clienteById, buscarClientes, crearCliente, editarCliente, eliminarCliente, habilitarCuentaCorriente, abonarCuenta, agregarMovimiento, clientesConCuenta, clientesSinCuenta, nombreCompleto } = require('../store/dbClientes');
const { listContenedores } = require('../store/dbContenedor');
const { listTransacciones } = require('../store/dbTransacciones');
const supabase = require('../lib/supabase');

const clienteController = {
    index: async (req, res) => {
        const { nombre, dni, id } = req.query;
        let clientes;
        if (nombre || dni || id) {
            clientes = await buscarClientes({ id, nombre, dni });
        } else {
            clientes = await listClientes();
        }
        res.render('clientes/index', { clientes, filtros: { id: id || '', nombre: nombre || '', dni: dni || '' } });
    },

    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = await clienteById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');

        const { fechaDesde, fechaHasta, tipoOp } = req.query;

        const contenedores = await listContenedores();
        const fullName = nombreCompleto(cliente);
        let alquileres = contenedores.filter(c => c.clienteId === cliente.id || c.cliente === fullName);
        const transacciones = (await listTransacciones()).filter(t => t.clienteId === cliente.id || t.cliente === fullName);

        // filtros de fecha
        if (fechaDesde) alquileres = alquileres.filter(a => a.inicioAlquiler && a.inicioAlquiler >= fechaDesde);
        if (fechaHasta) alquileres = alquileres.filter(a => a.inicioAlquiler && a.inicioAlquiler <= fechaHasta);

        const filtros = { fechaDesde: fechaDesde || '', fechaHasta: fechaHasta || '', tipoOp: tipoOp || '' };

        // deudas de cuenta corriente
        const deudasCC = transacciones.filter(t => t.metodoPago === 'cuenta_corriente');

        // traigo los movimientos para saber cuales deudas ya se saldaron
        const { data: movsRaw } = await supabase.from('movimientos_cuenta').select('*').eq('cliente_id', cliente.id);
        const movimientos = movsRaw || [];
        const saldadas = new Set(
            movimientos
                .filter(m => m.tipo === 'pago' && /Saldo transaccion #(\d+)/.test(m.descripcion || ''))
                .map(m => Number((m.descripcion.match(/Saldo transaccion #(\d+)/) || [])[1]))
        );
        const deudasPendientes = deudasCC
            .map(t => ({ ...t, saldada: saldadas.has(t.id) }))
            .filter(t => !t.saldada);

        res.render('clientes/detalle', { cliente, alquileres, transacciones, filtros, deudasCC: deudasPendientes });
    },

    saldarTransaccion: async (req, res) => {
        const clienteId = Number(req.params.id);
        const transaccionId = Number(req.params.transaccionId);
        const cliente = await clienteById(clienteId);
        if (!cliente) return res.redirect('/clientes');

        // chequeo que no se haya saldado ya (para evitar pagos duplicados)
        const { data: movsRaw } = await supabase.from('movimientos_cuenta').select('*').eq('cliente_id', clienteId);
        const yaSaldada = (movsRaw || []).some(m =>
            m.tipo === 'pago' && (m.descripcion || '').includes(`Saldo transaccion #${transaccionId}`)
        );
        if (yaSaldada) return res.redirect(`/clientes/detalle/${clienteId}`);

        const { data: trans } = await supabase.from('transacciones').select('*').eq('id', transaccionId).single();
        if (!trans) return res.redirect(`/clientes/detalle/${clienteId}`);

        await agregarMovimiento(clienteId, {
            tipo: 'pago',
            descripcion: `Saldo transaccion #${transaccionId}`,
            monto: Number(trans.monto) || 0
        });
        res.redirect(`/clientes/detalle/${clienteId}`);
    },

    cuentas: async (req, res) => {
        const conCuenta = await clientesConCuenta();
        const sinCuenta = await clientesSinCuenta();
        res.render('clientes/cuentas', { conCuenta, sinCuenta });
    },

    cuentaDetalle: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = await clienteById(id);
        if (!cliente || !cliente.cuentaCorriente) return res.redirect('/clientes/cuentas');

        const fullName = nombreCompleto(cliente);
        const transacciones = (await listTransacciones()).filter(t =>
            (t.clienteId === cliente.id || t.cliente === fullName) && t.metodoPago === 'cuenta_corriente'
        );

        const { data: movsRaw } = await supabase.from('movimientos_cuenta').select('*').eq('cliente_id', cliente.id);
        const saldadas = new Set(
            (movsRaw || [])
                .filter(m => m.tipo === 'pago' && /Saldo transaccion #(\d+)/.test(m.descripcion || ''))
                .map(m => Number((m.descripcion.match(/Saldo transaccion #(\d+)/) || [])[1]))
        );
        const deudasPendientes = transacciones
            .map(t => ({ ...t, saldada: saldadas.has(t.id) }))
            .filter(t => !t.saldada);
        const deudaTotal = deudasPendientes.reduce((acc, t) => acc + (t.monto || 0), 0);

        res.render('clientes/cuenta_detalle', { cliente, deudasCC: deudasPendientes, deudaTotal });
    },

    nuevo: (req, res) => {
        res.render('clientes/nuevo_cliente');
    },

    crearCliente: async (req, res) => {
        const { nombre, apellido, dni, telefono, email, direccion, cuentaCorriente } = req.body;
        await crearCliente({ nombre, apellido, dni, telefono, email, direccion, cuentaCorriente });
        res.redirect('/clientes');
    },

    editar: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = await clienteById(id);
        if (!cliente) return res.status(404).send('Cliente no encontrado');
        res.render('clientes/editar', { cliente, error: null });
    },

    guardarEdicion: async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, apellido, dni, telefono, email, direccion, cuentaCorriente } = req.body;
        if (!nombre || !apellido) {
            const cliente = await clienteById(id);
            return res.render('clientes/editar', { cliente, error: 'Nombre y apellido son obligatorios.' });
        }
        await editarCliente(id, { nombre, apellido, dni, telefono, email, direccion, cuentaCorriente });
        res.redirect(`/clientes/detalle/${id}`);
    },

    eliminar: async (req, res) => {
        const id = Number(req.params.id);
        await eliminarCliente(id);
        res.redirect('/clientes');
    },

    habilitarCuenta: async (req, res) => {
        const id = Number(req.params.id);
        await habilitarCuentaCorriente(id);
        res.redirect('/clientes/cuentas');
    },

    abonar: async (req, res) => {
        const id = Number(req.params.id);
        const cliente = await clienteById(id);
        if (!cliente || !cliente.cuentaCorriente) return res.redirect('/clientes/cuentas');
        const deuda = Math.abs(Math.min(cliente.saldo, 0));
        let monto = Number(req.body.monto);
        if (!monto || monto <= 0) return res.redirect('/clientes/cuentas');
        if (monto > deuda) monto = deuda; // no puede pagar mas de lo que debe
        await abonarCuenta(id, monto);
        res.redirect('/clientes/cuentas');
    },

    // endpoints JSON para buscar/crear clientes desde el front
    buscarApi: async (req, res) => {
        const { id, dni, nombre } = req.query;
        if (!id && !dni && !nombre) return res.json([]);
        const resultados = await buscarClientes({ id, dni, nombre });
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

    crearApi: async (req, res) => {
        const { nombre, apellido, dni, telefono, email } = req.body;
        if (!nombre || !apellido || !telefono) {
            return res.status(400).json({ error: 'Nombre, apellido y telefono son obligatorios' });
        }
        const nuevo = await crearCliente({ nombre, apellido, dni, telefono, email });
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
