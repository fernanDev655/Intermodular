// login.js - Login con validación a tiempo real (igual que comercial/admin)

const API_URL = 'http://localhost:8088/api';

const CODIGOS_ROLES = {
    'icqb': ['mecanico', 'comercial', 'admin'],
    'meca': ['mecanico'],
    'vent': ['comercial'],
    'admn': ['admin']
};

let rolSeleccionado = 'cliente';

// ─── VALIDACIONES ────────────────────────────────────────────
const VALIDACIONES = {
    loginEmail:    { fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Correo electrónico inválido' },
    loginPassword: { fn: v => v.length >= 6,                                msg: 'Mínimo 6 caracteres' }
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
    const btn = document.querySelector('#loginForm .btn-submit');
    if (!btn) return;

    const total = Object.keys(VALIDACIONES).length;
    const validos = Object.values(estadoValidacion).filter(v => v === true).length;
    const todosValidos = validos === total;

    btn.disabled = !todosValidos;
    btn.style.opacity = todosValidos ? '1' : '0.45';
    btn.style.cursor = todosValidos ? 'pointer' : 'not-allowed';

    const bar = document.getElementById('loginProgressBar');
    if (bar) bar.style.width = `${Math.round((validos / total) * 100)}%`;
}

function setupValidacionTiempoReal() {
    Object.keys(VALIDACIONES).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        estadoValidacion[id] = false;

        const evento = (el.tagName === 'SELECT') ? 'change' : 'input';
        el.addEventListener(evento, () => validarCampo(id));

        el.addEventListener('blur', () => {
            if (el.value !== '' || el.tagName === 'SELECT') validarCampo(id);
        });
    });

    actualizarBotonSubmit();
}

// ─── LOGIN ───────────────────────────────────────────────────
async function handleLogin(event) {
    event.preventDefault();

    let todoValido = true;
    Object.keys(VALIDACIONES).forEach(id => { if (!validarCampo(id)) todoValido = false; });
    if (!todoValido) return;

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rolSelect = document.getElementById('loginRol');

    if (rolSelect && rolSelect.style.display !== 'none') {
        rolSeleccionado = rolSelect.value;
    }

    const btnSubmit = document.querySelector('.btn-submit');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Verificando...</span>';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Credenciales inválidas');
        }

        const user = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(user));

        const redirectUrl = obtenerRedirectPorRol(user.role.toLowerCase());
        mostrarExito('¡Bienvenido! Redirigiendo...');
        setTimeout(() => { window.location.href = redirectUrl; }, 800);

    } catch (error) {
        mostrarError(error.message || 'Error al iniciar sesión');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
        actualizarBotonSubmit();
    }
}

function verificarCodigo() {
    const codigo = document.getElementById('codigoAcceso').value.toLowerCase().trim();
    const mensaje = document.getElementById('mensajeCodigo');
    const rolSelector = document.getElementById('rolSelector');

    const rolesPermitidos = CODIGOS_ROLES[codigo];

    if (rolesPermitidos) {
        mensaje.innerHTML = '<span class="success-icon">✓</span> Acceso concedido. Selecciona tu rol.';
        mensaje.className = 'code-message success';

        const select = document.getElementById('loginRol');
        select.innerHTML = '';
        rolesPermitidos.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol;
            option.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);
            select.appendChild(option);
        });
        if (!rolesPermitidos.includes('cliente')) {
            const opt = document.createElement('option');
            opt.value = 'cliente'; opt.textContent = 'Cliente';
            select.insertBefore(opt, select.firstChild);
        }

        rolSelector.style.display = 'block';
        rolSeleccionado = select.value;
        rolSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        mensaje.innerHTML = '<span class="error-icon">✕</span> Código inválido';
        mensaje.className = 'code-message error';
        rolSelector.style.display = 'none';
    }
}

function obtenerRedirectPorRol(rol) {
    const redirects = {
        'cliente': 'coleccion.html', 'user': 'coleccion.html',
        'mecanico': 'mecanico-panel.html',
        'comercial': 'comercial-panel.html',
        'admin': 'admin-panel.html', 'administrador': 'admin-panel.html'
    };
    return redirects[rol] || 'index.html';
}

function mostrarError(mensaje) {
    let div = document.getElementById('errorMensaje');
    if (!div) {
        div = document.createElement('div');
        div.id = 'errorMensaje';
        div.className = 'error-message';
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(div, form);
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
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(div, form);
    }
    div.innerHTML = `<span class="success-icon">✓</span> ${mensaje}`;
    div.style.display = 'block';
}

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupValidacionTiempoReal();

    const codigoInput = document.getElementById('codigoAcceso');
    if (codigoInput) {
        codigoInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); verificarCodigo(); }
        });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('registro') === 'exitoso') {
        mostrarExito('¡Cuenta creada! Ahora puedes iniciar sesión');
    }
});