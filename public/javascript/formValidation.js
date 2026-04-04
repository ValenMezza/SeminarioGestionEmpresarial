// ── Validacion de formularios reutilizable ──────────────────────
function validarFormulario(form, camposRequeridos) {
    let valido = true;
    // Limpiar errores previos
    form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    form.querySelectorAll('.field-error-msg').forEach(el => el.remove());

    camposRequeridos.forEach(selector => {
        const campo = form.querySelector(selector);
        if (!campo) return;

        // Saltar campos ocultos (display:none en el campo o su contenedor)
        if (campo.offsetParent === null) return;

        const valor = campo.value?.trim();
        if (!valor) {
            valido = false;
            campo.classList.add('field-error');
            const msg = document.createElement('span');
            msg.className = 'field-error-msg';
            msg.textContent = 'Este campo es obligatorio';
            campo.parentNode.appendChild(msg);
        }
    });

    return valido;
}

// Limpiar error al escribir
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('field-error')) {
        e.target.classList.remove('field-error');
        const msg = e.target.parentNode.querySelector('.field-error-msg');
        if (msg) msg.remove();
    }
});

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('field-error')) {
        e.target.classList.remove('field-error');
        const msg = e.target.parentNode.querySelector('.field-error-msg');
        if (msg) msg.remove();
    }
});
