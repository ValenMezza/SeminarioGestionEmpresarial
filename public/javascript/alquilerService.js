// ── Helpers ────────────────────────────────────────────────────
function toInputDate(date) {
    return date.toISOString().split('T')[0];
}

// Tarifa alquiler: 9 dias = 250000; menos dias = 30000/dia
function calcularPrecioAlquiler(dias) {
    if (!dias || dias <= 0) return 0;
    if (dias >= 9) return 250000;
    return dias * 30000;
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
    iframeMapa.src = `https://maps.google.com/maps?q=${encodeURIComponent(query + ', Cordoba, Argentina')}&output=embed&hl=es`;
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

// Precargar mapa si ya hay direccion (pagina editar)
const calleInicial  = document.getElementById('calle')?.value.trim();
const numeroInicial = document.getElementById('numero')?.value.trim();
if (calleInicial && numeroInicial) {
    cargarMapa(`${calleInicial} ${numeroInicial}`);
}

// ── Fechas ─────────────────────────────────────────────────────
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin    = document.getElementById('fechaFin');

// Validacion de fechas: minimo 4 dias, maximo 9 dias (solo en form nuevo)
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

// ── Precio editable ───────────────────────────────────────────
const checkEditarPrecio = document.getElementById('checkEditarPrecio');
const precioDisplay     = document.getElementById('precioAlquilerDisplay');
const precioInput       = document.getElementById('precioAlquilerInput');

if (checkEditarPrecio) {
    checkEditarPrecio.addEventListener('change', () => {
        if (precioInput) precioInput.style.display = checkEditarPrecio.checked ? 'block' : 'none';
        if (precioDisplay) precioDisplay.style.display = checkEditarPrecio.checked ? 'none' : '';
    });
}

// ── Resumen en tiempo real ─────────────────────────────────────
function actualizarResumen() {
    const calleEl      = document.getElementById('calle');
    const numeroEl     = document.getElementById('numero');
    const metodoPagoEl = document.getElementById('metodoPago');

    // Cliente (desde buscarCliente.js)
    const clienteNombre = document.getElementById('inputClienteNombre')?.value || '—';
    const elCliente = document.getElementById('res-cliente');
    if (elCliente) elCliente.textContent = clienteNombre;

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
        if (elDias) elDias.textContent = dias > 0 ? `${dias} dias` : '—';
        const precio = calcularPrecioAlquiler(dias);
        if (elTotalV) elTotalV.textContent = '$' + precio.toLocaleString('es-AR');
        if (elTotal)  elTotal.style.display = 'flex';

        // Sincronizar precio con display e input (si el usuario no lo esta editando manualmente)
        if (precioDisplay && !checkEditarPrecio?.checked) {
            precioDisplay.textContent = '$' + precio.toLocaleString('es-AR');
        }
        if (precioInput && !checkEditarPrecio?.checked) {
            precioInput.value = precio;
        }
        let inputPrecioHidden = document.getElementById('inputContenedorPrecio');
        if (inputPrecioHidden) inputPrecioHidden.value = precio;
    } else {
        if (elDias)  elDias.textContent   = '—';
        if (elTotal) elTotal.style.display = 'none';
    }

    // Direccion
    const calle  = calleEl?.value.trim();
    const numero = numeroEl?.value.trim();
    const elDir  = document.getElementById('res-direccion');
    if (elDir) elDir.textContent = calle && numero ? `${calle} ${numero}` : calle || '—';

    // Pago
    const pagoMap = { efectivo: 'Efectivo', transferencia: 'Transferencia', cuenta_corriente: 'Cuenta corriente' };
    const elPago  = document.getElementById('res-pago');
    if (elPago) elPago.textContent = pagoMap[metodoPagoEl?.value] || '—';
}

// Escuchar cambios
['fechaInicio','fechaFin','calle','numero','metodoPago'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', actualizarResumen);
    document.getElementById(id)?.addEventListener('input',  actualizarResumen);
});

// Escuchar seleccion de cliente desde buscarCliente.js
document.addEventListener('clienteSeleccionado', actualizarResumen);
document.addEventListener('clienteDeseleccionado', actualizarResumen);

actualizarResumen();

// ── Seleccion de contenedor via cards ──────────────────────────
let contenedorSeleccionado = null;

const btnConfirmar = document.getElementById('btnConfirmarAlquiler');

document.querySelectorAll('.btn-seleccionar-cont').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.alquiler-card');
        if (!card) return;

        document.querySelectorAll('.alquiler-card').forEach(c => c.classList.remove('alquiler-card--selected'));
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

        const elCont = document.getElementById('res-contenedor');
        if (elCont) elCont.textContent = `Contenedor #${contenedorSeleccionado.id}`;

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
    const modal = document.getElementById('modal-alquiler');
    if (modal) modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function cerrarModalAlquiler() {
    const modal = document.getElementById('modal-alquiler');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

if (btnConfirmar) {
    btnConfirmar.addEventListener('click', () => {
        if (!contenedorSeleccionado) return;

        const inputId = document.getElementById('inputContenedorId');
        if (inputId) inputId.value = contenedorSeleccionado.id;

        let inputPrecio = document.getElementById('inputContenedorPrecio');
        if (!inputPrecio) {
            inputPrecio = document.createElement('input');
            inputPrecio.type = 'hidden';
            inputPrecio.id   = 'inputContenedorPrecio';
            document.getElementById('formNuevoAlquiler')?.appendChild(inputPrecio);
        }
        inputPrecio.value = contenedorSeleccionado.precio;

        // Actualizar display de precio
        if (precioDisplay) precioDisplay.textContent = '$' + Number(contenedorSeleccionado.precio).toLocaleString('es-AR');
        if (precioInput) precioInput.value = contenedorSeleccionado.precio;

        const labelModal = document.getElementById('modal-cont-label');
        if (labelModal) labelModal.textContent = `Contenedor #${contenedorSeleccionado.id}`;

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

// ── Validacion al submit ──────────────────────────────────────
document.getElementById('formNuevoAlquiler')?.addEventListener('submit', (e) => {
    const clienteId = document.getElementById('inputClienteId')?.value;
    if (!clienteId) {
        alert('Busca y selecciona un cliente antes de confirmar.');
        e.preventDefault();
        return;
    }
    if (!validarFormulario(e.target, ['#fechaInicio', '#fechaFin', '#calle', '#numero'])) {
        e.preventDefault();
    }
});

// ── Modal confirmacion (pagina editar) ────────────────────────
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
}

// ── Renovar alquiler (precarga desde detalle) ──────────────────
const renovarEl = document.getElementById('renovar-datos');
const renovar = renovarEl ? JSON.parse(renovarEl.textContent) : null;
if (renovar) {
    const inputId = document.getElementById('inputContenedorId');
    if (inputId) inputId.value = renovar.id;

    let inputPrecio = document.getElementById('inputContenedorPrecio');
    if (!inputPrecio) {
        inputPrecio = document.createElement('input');
        inputPrecio.type  = 'hidden';
        inputPrecio.id    = 'inputContenedorPrecio';
        inputPrecio.name  = 'precioAlquiler';
        document.getElementById('formNuevoAlquiler')?.appendChild(inputPrecio);
    }
    inputPrecio.value = renovar.precio;

    if (precioDisplay) precioDisplay.textContent = '$' + Number(renovar.precio).toLocaleString('es-AR');
    if (precioInput) precioInput.value = renovar.precio;

    const labelModal = document.getElementById('modal-cont-label');
    if (labelModal) labelModal.textContent = `Contenedor #${renovar.id}`;

    const elCont = document.getElementById('res-contenedor');
    if (elCont) elCont.textContent = `Contenedor #${renovar.id}`;

    // Pre-cargar cliente
    if (renovar.clienteId) {
        const inputClienteId     = document.getElementById('inputClienteId');
        const inputClienteNombre = document.getElementById('inputClienteNombre');
        if (inputClienteId)     inputClienteId.value     = renovar.clienteId;
        if (inputClienteNombre) inputClienteNombre.value = renovar.cliente || '';

        const selDiv = document.getElementById('clienteSeleccionado');
        const selNom = document.getElementById('clienteSeleccionadoNombre');
        const busqDiv = document.getElementById('buscarClienteComponent');
        if (selNom) selNom.textContent = renovar.cliente || '';
        if (selDiv) selDiv.style.display = '';
        if (busqDiv) {
            const inputs = busqDiv.querySelectorAll('input:not([type=hidden]), button');
            inputs.forEach(el => el.style.display = 'none');
        }
    }

    // Pre-cargar direccion
    const calleEl  = document.getElementById('calle');
    const numeroEl = document.getElementById('numero');
    if (calleEl)  calleEl.value  = renovar.calle  || '';
    if (numeroEl) numeroEl.value = renovar.numero || '';
    if (renovar.calle && renovar.numero) cargarMapa(`${renovar.calle} ${renovar.numero}`);

    // Fijar fecha de inicio al dia siguiente del fin actual
    if (renovar.finAlquilerActual && fechaInicio) {
        const finActual = new Date(renovar.finAlquilerActual + 'T00:00:00');
        finActual.setDate(finActual.getDate() + 1);
        const minInicio = toInputDate(finActual);
        fechaInicio.min   = minInicio;
        fechaInicio.value = minInicio;
        fechaInicio.dispatchEvent(new Event('change'));
    }

    actualizarResumen();
    abrirModalAlquiler();
}
