const { listContenedores, contenedorById, listContenedoresDisponibles, actualizarContenedor, listContenedoresPorFinalizar } = require("../store/dbContenedor")


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
        res.render('alquileres/nuevo_alquiler', { contenedorlibre, contenedoresPorFinalizar });
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
        return res.render('alquileres/editar', { contenedor })
    }
}

module.exports = alquilerController;