document.addEventListener('DOMContentLoaded', () => {
    const selectProducto = document.getElementById('productoViaje');
    const inputCantidad  = document.getElementById('cantidadViaje');
    const subtotalEl     = document.getElementById('subtotalProducto');
    const precioHidden   = document.getElementById('precioProductoHidden');
    const inputFlete     = document.getElementById('precioFlete');
    const totalDisplay   = document.getElementById('totalDisplay');
    const checkEditar    = document.getElementById('checkEditarTotal');
    const totalInput     = document.getElementById('precioTotalInput');
    const btnBuscar      = document.getElementById('btnBuscarDireccionViaje');
    const msgMapa        = document.getElementById('msgMapaViaje');
    const mapaDiv        = document.getElementById('mapaViaje');
    const iframeMapa     = document.getElementById('iframeMapaViaje');
    const opFinalizar    = document.getElementById('opFinalizar');
    const opProgramar    = document.getElementById('opProgramar');
    const hiddenFinalizar = document.getElementById('inputFinalizarAhora');
    const fechaInput     = document.getElementById('fechaViaje');

    // Fecha minima: hoy
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaInput) fechaInput.min = hoy;

    // Pre-llenar telefono cuando se selecciona cliente
    document.addEventListener('clienteSeleccionado', (e) => {
        const c = e.detail;
        const telInput = document.getElementById('telefonoViaje');
        if (telInput && c.telefono) telInput.value = c.telefono;
    });

    // Calcular precios
    function getPrecioUnitario() {
        const opt = selectProducto?.selectedOptions[0];
        return opt ? Number(opt.dataset.precio || 0) : 0;
    }

    function calcularPrecios() {
        const precio   = getPrecioUnitario();
        const cantidad = Number(inputCantidad?.value || 1);
        const flete    = Number(inputFlete?.value || 0);
        const subtotal = precio * cantidad;
        const total    = subtotal + flete;

        if (subtotalEl) subtotalEl.value = '$' + subtotal.toLocaleString('es-AR');
        if (precioHidden) precioHidden.value = subtotal;

        if (!checkEditar.checked) {
            if (totalDisplay) totalDisplay.value = '$' + total.toLocaleString('es-AR');
            if (totalInput)   totalInput.value = total;
        }
    }

    selectProducto?.addEventListener('change', calcularPrecios);
    inputCantidad?.addEventListener('input', calcularPrecios);
    inputFlete?.addEventListener('input', calcularPrecios);

    // Editar total manualmente
    checkEditar.addEventListener('change', () => {
        totalInput.style.display = checkEditar.checked ? 'block' : 'none';
        totalDisplay.style.display = checkEditar.checked ? 'none' : 'block';
        if (!checkEditar.checked) calcularPrecios();
    });

    // Tipo de operacion
    opFinalizar?.addEventListener('change', () => { hiddenFinalizar.value = 'true'; });
    opProgramar?.addEventListener('change', () => { hiddenFinalizar.value = 'false'; });

    // Mapa
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const calle  = document.getElementById('calleViaje')?.value.trim();
            const numero = document.getElementById('numeroViaje')?.value.trim();
            if (!calle) {
                if (msgMapa) { msgMapa.style.display = 'block'; msgMapa.textContent = 'Ingresa al menos la calle.'; }
                return;
            }
            const query = `${calle} ${numero || ''}, Cordoba, Argentina`;
            iframeMapa.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=es`;
            mapaDiv.style.display = 'block';
            msgMapa.style.display = 'none';
        });
    }

    // Validacion al submit
    document.getElementById('formViaje')?.addEventListener('submit', (e) => {
        const campos = ['#productoViaje', '#cantidadViaje', '#fechaViaje', '#calleViaje'];

        // Verificar cliente
        const clienteId = document.getElementById('inputClienteId')?.value;
        if (!clienteId) {
            alert('Busca y selecciona un cliente antes de confirmar.');
            e.preventDefault();
            return;
        }

        const tel = document.getElementById('telefonoViaje')?.value.trim();
        if (!tel) {
            alert('El telefono de contacto es obligatorio.');
            e.preventDefault();
            return;
        }

        if (!validarFormulario(e.target, campos)) {
            e.preventDefault();
            return;
        }

        // Asegurar que el total este seteado
        if (!checkEditar.checked) {
            calcularPrecios();
        }
    });

    calcularPrecios();
});
