const  alquilerController ={
    index: (req, res) =>{
        res.render('alquileres/index')
    },
    detalle :(req, res) =>{
        res.render('alquileres/detalle')
    },
    nuevoAlquiler: (req,res)=>{
        res.render ('alquileres/nuevo_alquiler')
    },
    edicionAlquiler:(req,res) =>{
        res.render ('alquileres/edicion_alquiler')
    }
}

module.exports = alquilerController;