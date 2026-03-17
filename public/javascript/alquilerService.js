// Referencias a fechas (declaradas primero para usarlas en toda la lógica)
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');

function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

// Toggle sección nuevo cliente
const checkNuevoCliente = document.getElementById('nuevoCliente');
const divCliente = document.getElementById('creacionCliente');
if (checkNuevoCliente && divCliente) {
    checkNuevoCliente.addEventListener('change', () => {
        divCliente.style.display = checkNuevoCliente.checked ? 'block' : 'none';
    });
}

// Toggle entre selects de contenedor
const checkPorFinalizar = document.getElementById('contenedorPorFinalizar');
const selectDisponibles = document.getElementById('selectDisponibles');
const selectPorFinalizar = document.getElementById('selectPorFinalizar');

function actualizarMinFechaInicio() {
    if (!fechaInicio) return;
    if (checkPorFinalizar && checkPorFinalizar.checked && selectPorFinalizar) {
        const selectedOption = selectPorFinalizar.options[selectPorFinalizar.selectedIndex];
        const finContenedor = selectedOption && selectedOption.dataset.fin;
        if (finContenedor) {
            fechaInicio.min = finContenedor;
            if (fechaInicio.value && fechaInicio.value < finContenedor) {
                fechaInicio.value = '';
                if (fechaFin) fechaFin.value = '';
            }
            return;
        }
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaInicio.min = toInputDate(hoy);
}

if (checkPorFinalizar && selectDisponibles && selectPorFinalizar) {
    checkPorFinalizar.addEventListener('change', () => {
        const usarPorFinalizar = checkPorFinalizar.checked;
        selectDisponibles.style.display = usarPorFinalizar ? 'none' : '';
        selectDisponibles.disabled = usarPorFinalizar;
        selectPorFinalizar.style.display = usarPorFinalizar ? '' : 'none';
        selectPorFinalizar.disabled = !usarPorFinalizar;
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        actualizarMinFechaInicio();
    });

    selectPorFinalizar.addEventListener('change', () => {
        if (fechaInicio) fechaInicio.value = '';
        if (fechaFin) fechaFin.value = '';
        actualizarMinFechaInicio();
    });
}

// Validación de fechas: mínimo 4 días, máximo 9 días
if (fechaInicio && fechaFin) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaInicio.min = toInputDate(hoy);

    fechaInicio.addEventListener('change', () => {
        if (!fechaInicio.value) return;
        const inicio = new Date(fechaInicio.value + 'T00:00:00');
        const minFin = new Date(inicio);
        minFin.setDate(minFin.getDate() + 4);
        const maxFin = new Date(inicio);
        maxFin.setDate(maxFin.getDate() + 9);
        fechaFin.min = toInputDate(minFin);
        fechaFin.max = toInputDate(maxFin);
        fechaFin.value = '';
    });
}
