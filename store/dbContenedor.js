
const dbContenedores = {
    listaContenedores: [
        { id: 1, estado: "Disponible", precioAlquiler: 15000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null },
        { id: 2, estado: "Disponible", precioAlquiler: 15000, precioDia: 5000, cliente: "Juan Perez", inicioAlquiler: "2024-06-01", finAlquiler: "2024-06-10", direccionAlquiler: "Calle Falsa 123" },
        { id: 3, estado: "Disponible", precioAlquiler: 15000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null },
        { id: 4, estado: "Disponible", precioAlquiler: 15000, precioDia: 5000, cliente: "Maria Lopez", inicioAlquiler: "2024-06-05", finAlquiler: "2024-06-15", direccionAlquiler: "Avenida Siempre Viva 456" },
        { id: 5, estado: "Disponible", precioAlquiler: 15000, precioDia: 5000, cliente: null, inicioAlquiler: null, finAlquiler: null, direccionAlquiler: null }
    ],
};

async function listContenedores() {
    return dbContenedores.listaContenedores;
}


async function listContenedoresAlquilados(){
    return dbContenedores.listaContenedores.filter(c=> c.estado === "Alquilado");
}

async function listContenedoresDisponibles (){
    return dbContenedores.listaContenedores.filter(c=> c.estado === "Disponible");
}

module.exports = {dbContenedores, listContenedores, listContenedoresAlquilados, listContenedoresDisponibles}