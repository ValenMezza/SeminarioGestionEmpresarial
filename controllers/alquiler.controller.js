const { listContenedores , contenedorById } = require("../store/dbContenedor")

const alquilerController = {
    index: async (req, res) => {
        const contenedores = await listContenedores();

        res.render('alquileres/index', { contenedores })
    },
    detalle:async (req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        if (!contenedor) {
            return res.status(400).send("Contenedor no encontrado")
        }
        res.render('alquileres/detalle',{contenedor})
    },
    nuevoAlquiler: (req, res) => {
        res.render('alquileres/nuevo_alquiler')
    },
    edicionAlquiler: async(req, res) => {
        const id = Number(req.params.id);
        const contenedor = await contenedorById(id);
        return res.render('alquileres/editar', { contenedor })
    }
}

module.exports = alquilerController;