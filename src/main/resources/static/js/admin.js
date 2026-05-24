// js/admin.js
// Panel de Administración - AutoElite
// API: Spring Boot - /api/admin/users

const API_BASE_URL = '/api';

// ============ ICONOS SVG ============
const ICON_EDITAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

const ICON_ELIMINAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

// ============ UTILIDADES HTTP ============
const apiFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (response.status === 401) {
            window.location.href = '/concesionario/login.html';
            return null;
        }
        if (response.status === 403) {
            alert('No tienes permisos de administrador');
            window.location.href = '/concesionario/index.html';
            return null;
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type');
        const text = await response.text();
        if (!text || text.trim() === '') return null;
        if (contentType && contentType.includes('application/json')) {
            return JSON.parse(text);
        }
        return text;
    } catch (error) {
        console.error('Error API:', error);
        throw error;
    }
};

// ============ OBTENER USUARIO ACTUAL ============
const getCurrentUser = () => {
    try {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        return null;
    }
};

// ============ CARGAR USUARIOS ============
const loadUsuarios = async () => {
    try {
        const usuarios = await apiFetch(`${API_BASE_URL}/admin/users`);
        if (usuarios) {
            console.log('Usuarios cargados:', usuarios);
            renderUsuarios(usuarios);
        }
    } catch (error) {
        mostrarNotificacion('Error al cargar usuarios', 'error');
        console.error(error);
    }
};

// ============ RENDERIZAR TABLA ============
const renderUsuarios = (usuarios) => {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    if (!tbody) return;

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                    No hay usuarios registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usuarios.map(u => `
        <tr data-id="${u.id}">
            <td>${escapeHtml(u.nombre || '-')}</td>
            <td>${escapeHtml(u.apellidos || '-')}</td>
            <td>${escapeHtml(u.dni || '-')}</td>
            <td>${escapeHtml(u.telefono || '-')}</td>
            <td>${escapeHtml(u.email || '-')}</td>
            <td>
                <span class="badge-rol rol-${(u.role || 'USER').toLowerCase()}">
                    ${formatearRol(u.role)}
                </span>
            </td>
            <td class="acciones-cell">
                <button onclick="abrirModalEditar(${u.id})" class="btn btn-sm btn-editar" title="Editar usuario">
                    ${ICON_EDITAR}
                </button>
                <button onclick="eliminarUsuario(${u.id})" class="btn btn-sm btn-eliminar" title="Eliminar usuario">
                    ${ICON_ELIMINAR}
                </button>
            </td>
        </tr>
    `).join('');
};

const escapeHtml = (text) => {
    if (text === null || text === undefined) return '-';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const formatearRol = (role) => {
    const roles = {
        'USER': 'Cliente',
        'CLIENTE': 'Cliente',
        'MECANICO': 'Mecánico',
        'COMERCIAL': 'Comercial',
        'ADMIN': 'Admin'
    };
    return roles[role?.toUpperCase()] || role || 'Usuario';
};

// ============ ELIMINAR USUARIO ============
const eliminarUsuario = async (id) => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === id) {
        alert('No puedes eliminar tu propia cuenta');
        return;
    }

    if (!confirm('¿Eliminar este usuario permanentemente?')) return;

    try {
        await apiFetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE'
        });

        mostrarNotificacion('Usuario eliminado correctamente', 'success');
        await loadUsuarios();

    } catch (error) {
        mostrarNotificacion('Error al eliminar usuario', 'error');
        console.error(error);
    }
};

// ============ EDITAR USUARIO ============
let usuarioEditandoId = null;

const abrirModalEditar = async (id) => {
    try {
        const usuario = await apiFetch(`${API_BASE_URL}/admin/users/${id}`);
        if (!usuario) return;

        usuarioEditandoId = id;

        document.getElementById('editNombre').value = usuario.nombre || '';
        document.getElementById('editApellidos').value = usuario.apellidos || '';
        document.getElementById('editDni').value = usuario.dni || '';
        document.getElementById('editTelefono').value = usuario.telefono || '';
        document.getElementById('editEmail').value = usuario.email || '';
        const roleValue = (usuario.role || 'USER').toUpperCase();
        document.getElementById('editRole').value = roleValue === 'ADMINISTRADOR' ? 'ADMIN' : roleValue;

        document.getElementById('modalEditar').classList.add('active');

    } catch (error) {
        mostrarNotificacion('Error al cargar usuario', 'error');
        console.error(error);
    }
};

const cerrarModalEditar = () => {
    document.getElementById('modalEditar').classList.remove('active');
    usuarioEditandoId = null;
    document.getElementById('formEditarUsuario').reset();
};

const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!usuarioEditandoId) return;

    const datos = {
        nombre: document.getElementById('editNombre').value.trim(),
        apellidos: document.getElementById('editApellidos').value.trim() || null,
        dni: document.getElementById('editDni').value.trim() || null,
        telefono: document.getElementById('editTelefono').value.trim() || null,
        email: document.getElementById('editEmail').value.trim(),
        role: document.getElementById('editRole').value.toUpperCase()
    };

    try {
        await apiFetch(`${API_BASE_URL}/admin/users/${usuarioEditandoId}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });

        cerrarModalEditar();
        mostrarNotificacion('Usuario actualizado correctamente', 'success');
        await loadUsuarios();

    } catch (error) {
        mostrarNotificacion('Error al actualizar usuario', 'error');
        console.error(error);
    }
};

// ============ NOTIFICACIONES ============
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notif = document.createElement('div');
    notif.className = `notificacion notificacion-${tipo}`;
    notif.textContent = mensaje;

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
};

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAuth === 'function') {
        checkAuth(['admin']);
    }

    loadUsuarios();

    const form = document.getElementById('formEditarUsuario');
    if (form) form.addEventListener('submit', guardarEdicion);

    const formCrear = document.getElementById('formCrearUsuario');
    if (formCrear) formCrear.addEventListener('submit', crearUsuario);
    setupValidacionCrear();

    const modalCrear = document.getElementById('modalCrear');
    if (modalCrear) {
        modalCrear.addEventListener('click', (e) => {
            if (e.target === modalCrear) cerrarModalCrear();
        });
    }

    const modal = document.getElementById('modalEditar');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModalEditar();
        });
    }

    const currentUser = getCurrentUser();
    const userNameEl = document.getElementById('userName');
    if (currentUser && userNameEl) {
        userNameEl.textContent = currentUser.nombre || currentUser.email || 'Admin';
    }
});

// ============ LOGOUT ============
const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accesoEspecial");
    window.location.href = "/concesionario/index.html";
};


// ============ VALIDACIÓN TIEMPO REAL - CREAR USUARIO ============

const VALIDACIONES_CREAR = {
    crearNombre:    { fn: v => v.trim().length >= 2,                             msg: 'Mínimo 2 caracteres' },
    crearApellidos: { fn: v => v.trim() === '' || v.trim().length >= 2,          msg: 'Mínimo 2 caracteres si se rellena', opcional: true },
    crearDni:       { fn: v => v.trim() === '' || /^[0-9]{8}[A-Za-z]$/.test(v.trim()), msg: '8 números + 1 letra (ej: 12345678A)', opcional: true },
    crearTelefono:  { fn: v => v.trim() === '' || /^[6789][0-9]{8}$/.test(v.trim()), msg: '9 dígitos, empieza por 6, 7, 8 o 9', opcional: true },
    crearEmail:     { fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),  msg: 'Email no válido' },
    crearPassword:  { fn: v => v.length >= 6,                                    msg: 'Mínimo 6 caracteres' },
};

const estadoValidacionCrear = {};

function validarCampoCrear(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const regla = VALIDACIONES_CREAR[id];
    if (!regla) return true;

    const valor = el.value;
    // Campos opcionales vacíos son válidos
    const ok = regla.fn(valor);
    estadoValidacionCrear[id] = ok;

    let errEl = el.parentElement.querySelector('.campo-error-admin');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'campo-error-admin';
        el.parentElement.appendChild(errEl);
    }

    if (ok) {
        el.classList.remove('campo-invalido-admin');
        // Solo marcar verde si tiene valor (o es requerido y válido)
        if (valor.trim() !== '') el.classList.add('campo-valido-admin');
        else el.classList.remove('campo-valido-admin');
        errEl.textContent = '';
        errEl.style.display = 'none';
    } else {
        el.classList.remove('campo-valido-admin');
        el.classList.add('campo-invalido-admin');
        errEl.textContent = regla.msg;
        errEl.style.display = 'block';
    }

    actualizarBotonCrear();
    return ok;
}

function actualizarBotonCrear() {
    const btn = document.querySelector('#formCrearUsuario .btn-primary');
    if (!btn) return;
    const total = Object.keys(VALIDACIONES_CREAR).length;
    const validos = Object.values(estadoValidacionCrear).filter(v => v === true).length;
    const todosValidos = validos === total;
    btn.disabled = !todosValidos;
    btn.style.opacity = todosValidos ? '1' : '0.45';
    btn.style.cursor = todosValidos ? 'pointer' : 'not-allowed';

    // Barra de progreso
    const bar = document.getElementById('crearProgressBar');
    if (bar) bar.style.width = `${Math.round((validos / total) * 100)}%`;
}

function setupValidacionCrear() {
    Object.keys(VALIDACIONES_CREAR).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        estadoValidacionCrear[id] = false;
        el.addEventListener('input', () => validarCampoCrear(id));
        el.addEventListener('blur', () => {
            if (el.value !== '') validarCampoCrear(id);
        });
    });
    actualizarBotonCrear();
}

function resetValidacionesCrear() {
    Object.keys(VALIDACIONES_CREAR).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('campo-valido-admin', 'campo-invalido-admin');
        estadoValidacionCrear[id] = false;
        const errEl = el.parentElement.querySelector('.campo-error-admin');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    });
    actualizarBotonCrear();
}

// ============ CREAR USUARIO ============
const abrirModalCrear = () => {
    document.getElementById('modalCrear').classList.add('active');
};

const cerrarModalCrear = () => {
    document.getElementById('modalCrear').classList.remove('active');
    document.getElementById('formCrearUsuario').reset();
    resetValidacionesCrear();
};

const crearUsuario = async (e) => {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('crearNombre').value.trim(),
        apellidos: document.getElementById('crearApellidos').value.trim() || null,
        dni: document.getElementById('crearDni').value.trim() || null,
        telefono: document.getElementById('crearTelefono').value.trim() || null,
        email: document.getElementById('crearEmail').value.trim(),
        password: document.getElementById('crearPassword').value,
        role: document.getElementById('crearRole').value.toUpperCase()
    };

    try {
        await apiFetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            body: JSON.stringify(datos)
        });

        cerrarModalCrear();
        mostrarNotificacion('Usuario creado correctamente', 'success');
        await loadUsuarios();

    } catch (error) {
        mostrarNotificacion('Error al crear usuario', 'error');
        console.error(error);
    }
};

// ============ ACCEDER COMO COMERCIAL (sin cerrar sesión admin) ============
const accederComoComercial = () => {
    const adminUser = getCurrentUser();

    // Guardar sesión admin para poder volver
    if (adminUser) {
        localStorage.setItem('adminSession', JSON.stringify(adminUser));
    }

    // Crear vista temporal con rol comercial (la sesión de servidor sigue siendo ADMINISTRADOR,
    // lo que permite al backend aceptar las peticiones a /api/admin/vehiculos)
    const comercialView = {
        ...(adminUser || {}),
        role: 'COMERCIAL',
        rol: 'comercial',
        _impersonating: true,
        _adminOriginalRole: adminUser?.role || adminUser?.rol
    };
    localStorage.setItem('currentUser', JSON.stringify(comercialView));
    localStorage.setItem('accesoEspecial', 'comercial');

    window.location.href = '/concesionario/comercial-panel.html';
};