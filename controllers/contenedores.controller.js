const  contenedoresController ={
    index: (req, res) =>{
        res.render('contenedores/index')
    },
    detalle: (req, res) =>{
        res.render('contenedores/detalle')
    }
}

module.exports = contenedoresController ;