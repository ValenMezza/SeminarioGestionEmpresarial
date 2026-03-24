const { listContenedores, contenedorById, listContenedoresDisponibles, actualizarContenedor, listContenedoresPorFinalizar, finalizarAlquiler } = require("../store/dbContenedor")
const { listClientes } = require("../store/dbClientes")


const alquilerController = {
    index: async (req, res) => {
        const contenedores = await listContenedores();

        res.render('alquileres/index', { contenedores })
    },
    detalle: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        if (!contenedor) {
            return res.status(400).send("Contenedor no encontrado")
        }
        res.render('alquileres/detalle', { contenedor })
    },
    nuevoAlquiler: async (req, res) => {
        const contenedorlibre = await listContenedoresDisponibles();
        const contenedoresPorFinalizar = listContenedoresPorFinalizar();
        const clientes = listClientes();
        res.render('alquileres/nuevo_alquiler', { contenedorlibre, contenedoresPorFinalizar, clientes });
    },

    crearAlquiler: async (req, res) => {
        const contenedorId = Number(req.body.contenedor);
        actualizarContenedor(contenedorId, {
            estado: 'Alquilado',
            cliente: req.body.cliente || req.body.nombreNuevoCliente,
            inicioAlquiler: req.body.fechaInicio,
            finAlquiler: req.body.fechaFin,
            direccionAlquiler: `${req.body.calle} ${req.body.numero}`,
        });
        
        res.redirect('/alquileres');
    },
    edicionAlquiler: async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        const dir = contenedor.direccionAlquiler || '';
        const lastSpace = dir.lastIndexOf(' ');
        const calle = lastSpace > 0 ? dir.substring(0, lastSpace) : dir;
        const numero = lastSpace > 0 ? dir.substring(lastSpace + 1) : '';
        return res.render('alquileres/editar', { contenedor, calle, numero });
    },
    guardarEdicion: async (req, res) => {
        const id = Number(req.params.id);
        actualizarContenedor(id, {
            cliente: req.body.cliente,
            inicioAlquiler: req.body.fechaInicio,
            finAlquiler: req.body.fechaFin,
            direccionAlquiler: `${req.body.calle} ${req.body.numero}`,
        });
        res.redirect(`/alquileres/detalle/${id}`);
    },
    finalizarAlquiler: (req, res) => {
        const id = Number(req.params.id);
        finalizarAlquiler(id);
        res.redirect('/alquileres');
    }
}

module.exports = alquilerController;