const dbAlquileres = {
    listaAlquileres: []
};

function crearAlquiler(alquiler) {

    dbAlquileres.listaAlquileres.push(alquiler);

    return alquiler;
}

function listAlquileres() {

    return dbAlquileres.listaAlquileres;

}

module.exports = {
    crearAlquiler,
    listAlquileres
};