const { listContenedores } = require("../store/dbContenedor");

const  contenedoresController ={
    index:async (req, res) =>{
        const contenedores = await listContenedores();
        res.render('contenedores/index', {contenedores})
    },
    detalle: (req, res) =>{
        res.render('contenedores/detalle')
    }
}

module.exports = contenedoresController ;