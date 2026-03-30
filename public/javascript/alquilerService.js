// ── Helpers ────────────────────────────────────────────────────
function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

function formatFechaLocal(val) {
    if (!val) return '—';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
}

// ── Mapa ───────────────────────────────────────────────────────
const btnBuscar  = document.getElementById('btnBuscarDireccion');
const mapaDiv    = document.getElementById('mapaEntrega');
const msgMapa    = document.getElementById('msgMapa');
const iframeMapa = document.getElementById('iframeMapa');

function cargarMapa(query) {
    if (!iframeMapa) return;
    iframeMapa.src = `https://maps.google.com/maps?q=${encodeURIComponent(query + ', Córdoba, Argentina')}&output=embed&hl=es`;
    if (mapaDiv)  mapaDiv.style.display  = 'block';
    if (msgMapa)  msgMapa.style.display  = 'none';
}

if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
        const calle  = document.getElementById('calle')?.value.trim();
        const numero = document.getElementById('numero')?.value.trim();
        if (!calle || !numero) {
            if (msgMapa) msgMapa.style.display = 'block';
            return;
        }
        cargarMapa(`${calle} ${numero}`);
    });
}

// Precargar mapa si ya hay dirección (página editar)
const calleInicial  = document.getElementById('calle')?.value.trim();
const numeroInicial = document.getElementById('numero')?.value.trim();
if (calleInicial && numeroInicial) {
    cargarMapa(`${calleInicial} ${numeroInicial}`);
}

// ── Fechas ─────────────────────────────────────────────────────
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin    = document.getElementById('fechaFin');

// Validación de fechas: mínimo 4 días, máximo 9 días (solo en form nuevo)
const esFormNuevo = !!document.getElementById('btnConfirmarAlquiler');
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
        fechaFin.min   = toInputDate(minFin);
        fechaFin.max   = toInputDate(maxFin);
        fechaFin.value = '';
        actualizarResumen();
    });
}

// ── Toggle nuevo cliente ───────────────────────────────────────
const checkNuevoCliente = document.getElementById('nuevoCliente');
const divCreacionCliente = document.getElementById('creacionCliente');
const selectCliente     = document.getElementById('cliente');

if (checkNuevoCliente && divCreacionCliente) {
    checkNuevoCliente.addEventListener('change', () => {
        const crear = checkNuevoCliente.checked;
        divCreacionCliente.style.display = crear ? 'block' : 'none';
        if (selectCliente) {
            selectCliente.disabled = crear;
            if (crear) selectCliente.value = '';
        }
        actualizarResumen();
    });
}

// ── Resumen en tiempo real ─────────────────────────────────────
function actualizarResumen() {
    const clienteEl    = document.getElementById('cliente');
    const calleEl      = document.getElementById('calle');
    const numeroEl     = document.getElementById('numero');
    const metodoPagoEl = document.getElementById('metodoPago');
    const nuevoCheck   = document.getElementById('nuevoCliente');
    const nuevoInput   = document.getElementById('nameNuevoCliente');

    // Cliente
    const clienteVal = nuevoCheck?.checked
        ? (nuevoInput?.value.trim() || '—')
        : (clienteEl?.value || '—');
    const elCliente = document.getElementById('res-cliente');
    if (elCliente) elCliente.textContent = clienteVal;

    // Fechas
    const inicioVal = fechaInicio?.value;
    const finVal    = fechaFin?.value;
    const elInicio  = document.getElementById('res-inicio');
    const elFin     = document.getElementById('res-fin');
    const elDias    = document.getElementById('res-dias');
    const elTotal   = document.getElementById('res-total');
    const elTotalV  = document.getElementById('res-total-valor');

    if (elInicio) elInicio.textContent = formatFechaLocal(inicioVal);
    if (elFin)    elFin.textContent    = formatFechaLocal(finVal);

    if (inicioVal && finVal) {
        const dias = Math.round((new Date(finVal) - new Date(inicioVal)) / 86400000);
        if (elDias) elDias.textContent = dias > 0 ? `${dias} días` : '—';
        const precio = Number(document.getElementById('inputContenedorPrecio')?.value || 0);
        if (elTotalV) elTotalV.textContent = '$' + precio.toLocaleString('es-AR');
        if (elTotal)  elTotal.style.display = 'flex';
    } else {
        if (elDias)  elDias.textContent   = '—';
        if (elTotal) elTotal.style.display = 'none';
    }

    // Dirección
    const calle  = calleEl?.value.trim();
    const numero = numeroEl?.value.trim();
    const elDir  = document.getElementById('res-direccion');
    if (elDir) elDir.textContent = calle && numero ? `${calle} ${numero}` : calle || '—';

    // Pago
    const pagoMap = { efectivo: 'Efectivo', transferencia: 'Transferencia' };
    const elPago  = document.getElementById('res-pago');
    if (elPago) elPago.textContent = pagoMap[metodoPagoEl?.value] || '—';
}

// Escuchar cambios en campos del formulario para actualizar resumen
['cliente','fechaInicio','fechaFin','calle','numero','metodoPago','nameNuevoCliente'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', actualizarResumen);
    document.getElementById(id)?.addEventListener('input',  actualizarResumen);
});
actualizarResumen();

// ── Selección de contenedor via cards ──────────────────────────
let contenedorSeleccionado = null;

const btnConfirmar = document.getElementById('btnConfirmarAlquiler');

document.querySelectorAll('.btn-seleccionar-cont').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.alquiler-card');
        if (!card) return;

        // Quitar selección anterior
        document.querySelectorAll('.alquiler-card').forEach(c => c.classList.remove('alquiler-card--selected'));

        // Marcar nueva selección
        card.classList.add('alquiler-card--selected');
        btn.textContent = 'Seleccionado ✓';
        document.querySelectorAll('.btn-seleccionar-cont').forEach(b => {
            if (b !== btn) b.textContent = 'Seleccionar';
        });

        contenedorSeleccionado = {
            id:     card.dataset.id,
            precio: card.dataset.precio,
            fin:    card.dataset.fin || null
        };

        // Actualizar resumen
        const elCont = document.getElementById('res-contenedor');
        if (elCont) elCont.textContent = `Contenedor #${contenedorSeleccionado.id}`;

        // Habilitar botón confirmar
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.classList.add('btn-confirmar-alquiler--ready');
        }

        actualizarResumen();
    });
});

// ── Toggle lista disponibles / por finalizar ───────────────────
const checkPorFinalizar  = document.getElementById('contenedorPorFinalizar');
const listaDisponibles   = document.getElementById('listaDisponibles');
const listaPorFinalizar  = document.getElementById('listaPorFinalizar');

if (checkPorFinalizar) {
    checkPorFinalizar.addEventListener('change', () => {
        const usar = checkPorFinalizar.checked;
        if (listaDisponibles)  listaDisponibles.style.display  = usar ? 'none' : '';
        if (listaPorFinalizar) listaPorFinalizar.style.display = usar ? '' : 'none';

        // Deseleccionar container al cambiar lista
        document.querySelectorAll('.alquiler-card').forEach(c => c.classList.remove('alquiler-card--selected'));
        document.querySelectorAll('.btn-seleccionar-cont').forEach(b => b.textContent = 'Seleccionar');
        contenedorSeleccionado = null;
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.classList.remove('btn-confirmar-alquiler--ready');
        }
        const elCont = document.getElementById('res-contenedor');
        if (elCont) elCont.textContent = '—';
        actualizarResumen();
    });
}

// ── Modal alquiler ─────────────────────────────────────────────
function abrirModalAlquiler() {
    document.getElementById('modal-alquiler').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function cerrarModalAlquiler() {
    document.getElementById('modal-alquiler').style.display = 'none';
    document.body.style.overflow = '';
}

if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
        if (!contenedorSeleccionado) return;

        // Poner el ID y precio del contenedor seleccionado en el form
        const inputId = document.getElementById('inputContenedorId');
        if (inputId) inputId.value = contenedorSeleccionado.id;

        // Guardar precio para el resumen
        let inputPrecio = document.getElementById('inputContenedorPrecio');
        if (!inputPrecio) {
            inputPrecio = document.createElement('input');
            inputPrecio.type = 'hidden';
            inputPrecio.id   = 'inputContenedorPrecio';
            document.getElementById('formNuevoAlquiler')?.appendChild(inputPrecio);
        }
        inputPrecio.value = contenedorSeleccionado.precio;

        // Actualizar label del modal
        const labelModal = document.getElementById('modal-cont-label');
        if (labelModal) labelModal.textContent = `Contenedor #${contenedorSeleccionado.id}`;

        // Si es por finalizar, fijar min fecha inicio
        if (contenedorSeleccionado.fin && fechaInicio) {
            fechaInicio.min = contenedorSeleccionado.fin;
            fechaInicio.value = '';
            if (fechaFin) fechaFin.value = '';
        }

        abrirModalAlquiler();
        actualizarResumen();
    });
}

document.getElementById('cerrarModalAlquiler')?.addEventListener('click', cerrarModalAlquiler);
document.getElementById('cancelarModalAlquiler')?.addEventListener('click', cerrarModalAlquiler);

document.getElementById('modal-alquiler')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-alquiler') cerrarModalAlquiler();
});

// ── Modal confirmación (página editar) ────────────────────────
const btnGuardar       = document.getElementById('btnGuardar');
const modalConfirmar   = document.getElementById('modalConfirmar');
const btnConfirmarModal = document.getElementById('btnConfirmarModal');
const btnCancelarModal  = document.getElementById('btnCancelarModal');

if (btnGuardar && modalConfirmar) {
    btnGuardar.addEventListener('click', () => {
        modalConfirmar.style.display = 'flex';
    });
    btnCancelarModal?.addEventListener('click', () => {
        modalConfirmar.style.display = 'none';
    });
    btnConfirmarModal?.addEventListener('click', () => {
        btnGuardar.closest('form').submit();
    });
    modalConfirmar.addEventListener('click', (e) => {
        if (e.target === modalConfirmar) modalConfirmar.style.display = 'none';
    });
}
