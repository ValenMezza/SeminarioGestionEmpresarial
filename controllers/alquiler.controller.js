const { listContenedores } = require("../store/dbContenedor")

const alquilerController = {
    index: async (req, res) => {
        const contenedores = await listContenedores();

        res.render('alquileres/index', { contenedores })
    },
    detalle: (req, res) => {
        res.render('alquileres/detalle')
    },
    nuevoAlquiler: (req, res) => {
        res.render('alquileres/nuevo_alquiler')
    },
    edicionAlquiler: (req, res) => {
        res.render('alquileres/edicion_alquiler')
    }
}

module.exports = alquilerController;