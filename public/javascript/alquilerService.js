// Mapa con iframe de Google Maps
const btnBuscar = document.getElementById('btnBuscarDireccion');
const mapaDiv = document.getElementById('mapaEntrega');
const msgMapa = document.getElementById('msgMapa');
const iframeMapa = document.getElementById('iframeMapa');

function cargarMapa(query) {
    iframeMapa.src = `https://maps.google.com/maps?q=${encodeURIComponent(query + ', Córdoba, Argentina')}&output=embed&hl=es`;
    mapaDiv.style.display = 'block';
    if (msgMapa) msgMapa.style.display = 'none';
}

if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
        const calle = document.getElementById('calle')?.value.trim();
        const numero = document.getElementById('numero')?.value.trim();
        if (!calle || !numero) {
            if (msgMapa) msgMapa.style.display = 'block';
            return;
        }
        cargarMapa(`${calle} ${numero}`);
    });
}

// Precargar mapa si ya hay dirección guardada (página editar)
const calleInicial = document.getElementById('calle')?.value.trim();
const numeroInicial = document.getElementById('numero')?.value.trim();
if (calleInicial && numeroInicial) {
    cargarMapa(`${calleInicial} ${numeroInicial}`);
}

// Referencias a fechas (declaradas primero para usarlas en toda la lógica)
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');

function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

// Toggle sección nuevo cliente
const checkNuevoCliente = document.getElementById('nuevoCliente');
const divCliente = document.getElementById('creacionCliente');
const selectCliente = document.getElementById('cliente');
if (checkNuevoCliente && divCliente) {
    checkNuevoCliente.addEventListener('change', () => {
        const crear = checkNuevoCliente.checked;
        divCliente.style.display = crear ? 'block' : 'none';
        if (selectCliente) {
            selectCliente.disabled = crear;
            if (crear) selectCliente.value = '';
        }
        actualizarResumen();
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

const grupoPorFinalizar = document.getElementById('grupoPorFinalizar');

if (checkPorFinalizar && selectDisponibles && selectPorFinalizar) {
    checkPorFinalizar.addEventListener('change', () => {
        const usarPorFinalizar = checkPorFinalizar.checked;
        selectDisponibles.closest('.form-group').style.display = usarPorFinalizar ? 'none' : '';
        selectDisponibles.disabled = usarPorFinalizar;
        if (grupoPorFinalizar) grupoPorFinalizar.style.display = usarPorFinalizar ? '' : 'none';
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

// ── Resumen en tiempo real ────────────────────────────────────
function formatFechaLocal(val) {
    if (!val) return '—';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
}

function actualizarResumen() {
    const clienteEl    = document.getElementById('cliente');
    const contDisp     = document.getElementById('selectDisponibles');
    const contFin      = document.getElementById('selectPorFinalizar');
    const usarFin      = document.getElementById('contenedorPorFinalizar');
    const calleEl      = document.getElementById('calle');
    const numeroEl     = document.getElementById('numero');
    const metodoPagoEl = document.getElementById('metodoPago');

    const nuevoClienteCheck = document.getElementById('nuevoCliente');
    const nuevoClienteInput = document.getElementById('nameNuevoCliente');
    const clienteVal = nuevoClienteCheck?.checked
        ? (nuevoClienteInput?.value.trim() || '—')
        : (clienteEl?.value || '—');
    document.getElementById('res-cliente').textContent = clienteVal;

    const contenedorVal = (usarFin?.checked ? contFin : contDisp)
        ?.options[(usarFin?.checked ? contFin : contDisp)?.selectedIndex]?.text || '—';
    document.getElementById('res-contenedor').textContent = contenedorVal;

    const inicioVal = fechaInicio?.value;
    const finVal    = fechaFin?.value;
    document.getElementById('res-inicio').textContent = formatFechaLocal(inicioVal);
    document.getElementById('res-fin').textContent    = formatFechaLocal(finVal);

    if (inicioVal && finVal) {
        const dias = Math.round((new Date(finVal) - new Date(inicioVal)) / 86400000);
        document.getElementById('res-dias').textContent = dias > 0 ? `${dias} días` : '—';

        const totalEl = document.getElementById('res-total');
        const precio = 30000;
        document.getElementById('res-total-valor').textContent =
            '$' + (precio).toLocaleString('es-AR');
        totalEl.style.display = 'flex';
    } else {
        document.getElementById('res-dias').textContent = '—';
        document.getElementById('res-total').style.display = 'none';
    }

    const calle  = calleEl?.value.trim();
    const numero = numeroEl?.value.trim();
    document.getElementById('res-direccion').textContent =
        calle && numero ? `${calle} ${numero}` : calle || '—';

    const pagoMap = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia' };
    document.getElementById('res-pago').textContent =
        pagoMap[metodoPagoEl?.value] || '—';
}

if (document.getElementById('res-cliente')) {
    ['cliente','selectDisponibles','selectPorFinalizar','contenedorPorFinalizar',
     'fechaInicio','fechaFin','calle','numero','metodoPago','nameNuevoCliente'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', actualizarResumen);
        document.getElementById(id)?.addEventListener('input', actualizarResumen);
    });
    actualizarResumen();
}

// Modal de confirmación (formulario editar)
const btnGuardar = document.getElementById('btnGuardar');
const modalConfirmar = document.getElementById('modalConfirmar');
const btnConfirmarModal = document.getElementById('btnConfirmarModal');
const btnCancelarModal = document.getElementById('btnCancelarModal');

if (btnGuardar && modalConfirmar) {
    btnGuardar.addEventListener('click', () => {
        modalConfirmar.style.display = 'flex';
    });
    btnCancelarModal.addEventListener('click', () => {
        modalConfirmar.style.display = 'none';
    });
    btnConfirmarModal.addEventListener('click', () => {
        btnGuardar.closest('form').submit();
    });
    modalConfirmar.addEventListener('click', (e) => {
        if (e.target === modalConfirmar) modalConfirmar.style.display = 'none';
    });
}

// Validación de fechas: mínimo 4 días, máximo 9 días (solo en form nuevo)
const esFormNuevo = !!document.getElementById('selectDisponibles');
if (esFormNuevo && fechaInicio && fechaFin) {
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
