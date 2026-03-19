const { listContenedores, actualizarPrecios } = require("../store/dbContenedor");

const  contenedoresController ={
    index:async (req, res) =>{
        const contenedores = await listContenedores();
        res.render('contenedores/index', {contenedores})
    },
    detalle: (req, res) =>{
        res.render('contenedores/detalle')
    },
    config: async(req, res) =>{
        const contenedores = await listContenedores();
        res.render('contenedores/config', {contenedores})
    },
    guardarConfig: (req, res) => {
        const { precioPorDia, precioAlquiler } = req.body;
        actualizarPrecios(Number(precioPorDia), Number(precioAlquiler));
        res.redirect('/contenedores/config');
    }
}       

module.exports = contenedoresController ;