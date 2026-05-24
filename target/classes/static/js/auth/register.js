// register.js - Registro con validación a tiempo real (igual que comercial/admin)

const API_URL = 'http://localhost:8088/api';

// ─── VALIDACIONES ────────────────────────────────────────────
const VALIDACIONES = {
    regNombre:    { fn: v => v.trim().length >= 2,                                                                    msg: 'Mínimo 2 caracteres' },
    regEmail:     { fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),                                           msg: 'Correo electrónico inválido' },
    regPassword:  { fn: v => v.length >= 6,                                                                           msg: 'Mínimo 6 caracteres' },
    regPassword2: { fn: v => { const p = document.getElementById('regPassword'); return p && v === p.value && v.length >= 6; }, msg: 'Las contraseñas no coinciden' }
};

const estadoValidacion = {};

function validarCampo(id) {
    const el = document.getElementById(id);
    if (!el) return true;

    const regla = VALIDACIONES[id];
    if (!regla) return true;

    const valor = el.value;
    const ok = regla.fn(valor);

    estadoValidacion[id] = ok;

    // En login/register: input > input-wrapper > input-group
    // El error debe ir en input-group (parentElement.parentElement)
    const inputGroup = el.parentElement.parentElement;

    let errEl = inputGroup.querySelector('.campo-error');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'campo-error';
        inputGroup.appendChild(errEl);
    }

    if (ok) {
        el.classList.remove('campo-invalido');
        el.classList.add('campo-valido');
        errEl.textContent = '';
        errEl.style.display = 'none';
    } else {
        el.classList.remove('campo-valido');
        el.classList.add('campo-invalido');
        errEl.textContent = regla.msg;
        errEl.style.display = 'block';
    }

    actualizarBotonSubmit();
    return ok;
}

function actualizarBotonSubmit() {
    const btn = document.querySelector('#registerForm .btn-submit');
    if (!btn) return;

    const total = Object.keys(VALIDACIONES).length;
    const validos = Object.values(estadoValidacion).filter(v => v === true).length;
    const todosValidos = validos === total;

    btn.disabled = !todosValidos;
    btn.style.opacity = todosValidos ? '1' : '0.45';
    btn.style.cursor = todosValidos ? 'pointer' : 'not-allowed';

    const bar = document.getElementById('registerProgressBar');
    if (bar) bar.style.width = `${Math.round((validos / total) * 100)}%`;
}

function setupValidacionTiempoReal() {
    Object.keys(VALIDACIONES).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        estadoValidacion[id] = false;

        const evento = (el.tagName === 'SELECT') ? 'change' : 'input';

        el.addEventListener(evento, () => {
            validarCampo(id);
            // Revalidar confirmación cuando cambia la contraseña principal
            if (id === 'regPassword') {
                const p2 = document.getElementById('regPassword2');
                if (p2 && p2.value !== '') validarCampo('regPassword2');
            }
        });

        el.addEventListener('blur', () => {
            if (el.value !== '' || el.tagName === 'SELECT') validarCampo(id);
        });
    });

    actualizarBotonSubmit();
}

// ─── REGISTRO ────────────────────────────────────────────────
async function handleRegister(event) {
    event.preventDefault();

    let todoValido = true;
    Object.keys(VALIDACIONES).forEach(id => { if (!validarCampo(id)) todoValido = false; });
    if (!todoValido) return;

    const nombre   = document.getElementById('regNombre').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    const btnSubmit = document.querySelector('.btn-submit');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Creando cuenta...</span>';

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Error al crear la cuenta');
        }

        mostrarExito('¡Cuenta creada exitosamente! Redirigiendo...');
        setTimeout(() => { window.location.href = 'login.html?registro=exitoso'; }, 1500);

    } catch (error) {
        mostrarError(error.message || 'Error de conexión con el servidor');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
        actualizarBotonSubmit();
    }
}

function mostrarError(mensaje) {
    let div = document.getElementById('errorMensaje');
    if (!div) {
        div = document.createElement('div');
        div.id = 'errorMensaje';
        div.className = 'error-message';
        document.querySelector('.auth-card').insertBefore(div, document.getElementById('registerForm'));
    }
    div.innerHTML = `<span class="error-icon">✕</span> ${mensaje}`;
    div.style.display = 'block';
    setTimeout(() => { div.style.display = 'none'; }, 5000);
}

function mostrarExito(mensaje) {
    let div = document.getElementById('successMensaje');
    if (!div) {
        div = document.createElement('div');
        div.id = 'successMensaje';
        div.className = 'success-message';
        document.querySelector('.auth-card').insertBefore(div, document.getElementById('registerForm'));
    }
    div.innerHTML = `<span class="success-icon">✓</span> ${mensaje}`;
    div.style.display = 'block';
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupValidacionTiempoReal();
});