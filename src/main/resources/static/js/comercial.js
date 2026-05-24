/* ============================================================
   COMERCIAL-PANEL.JS - Panel Comercial AutoElite
   CRUD Vehículos - Patrón idéntico a admin.js
   ============================================================ */

const API_BASE = '/api';
let vehiculoEditandoId = null;
let vehiculosCache = [];

/* ============================================================
   UTILIDADES HTTP (igual que admin.js)
   ============================================================ */
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
            alert('No tienes permisos');
            window.location.href = '/concesionario/index.html';
            return null;
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        if (response.status === 204) return null;

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

/* ============================================================
   AUTENTICACIÓN / SESIÓN
   ============================================================ */
const getCurrentUser = () => {
    try {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return null;
        const user = JSON.parse(userJson);
        if (!user) return null;
        const rawRole = (user.rol || user.role || 'cliente').toLowerCase();
        return {
            ...user,
            rol: rawRole === 'administrador' ? 'admin' : rawRole,
        };
    } catch (e) {
        return null;
    }
};

function checkAuth(rolesPermitidos) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accesoEspecial");
    localStorage.removeItem("adminSession");
    window.location.href = "index.html";
}

function volverAlAdmin() {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
        localStorage.setItem('currentUser', adminSession);
        localStorage.removeItem('adminSession');
        localStorage.removeItem('accesoEspecial');
        window.location.href = '/concesionario/admin-panel.html';
    } else {
        window.location.href = '/concesionario/admin-panel.html';
    }
}

/* ============================================================
   CARGAR VEHÍCULOS
   ============================================================ */
const loadVehiculos = async () => {
    try {
        const vehiculos = await apiFetch(`${API_BASE}/vehiculos`);
        if (vehiculos) {
            console.log('Vehículos cargados:', vehiculos);
            vehiculosCache = vehiculos.map(v => ({
                ...v,
                id: v.id || v.idVehiculo || v.vehiculoId || 0
            }));
            renderVehiculos(vehiculosCache);
        }
    } catch (error) {
        mostrarNotificacion('Error al cargar vehículos', 'error');
        console.error(error);
        vehiculosCache = getVehiculos();
        renderVehiculos(vehiculosCache);
    }
};

/* ============================================================
   RENDERIZAR TABLA
   ============================================================ */
const renderVehiculos = (vehiculos) => {
    const tbody = document.getElementById('tablaOfertasBody');
    if (!tbody) return;

    if (!vehiculos || vehiculos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No hay vehículos registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = vehiculos.map(v => {
        const vehiculoId = v.id || 0;

        let imgUrl = null;
        if (v.imagen) {
            if (v.imagen.startsWith('data:')) imgUrl = v.imagen;
            else if (v.imagen.startsWith('/')) imgUrl = `http://localhost:8088${v.imagen}`;
            else if (v.imagen.startsWith('http')) imgUrl = v.imagen;
            else imgUrl = `http://localhost:8088/uploads/vehiculo/${v.imagen}`;
        }

        const precioFormateado = v.precio
            ? parseFloat(v.precio).toLocaleString('es-ES', {style:'currency', currency:'EUR'})
            : 'N/A';

        return `
            <tr data-id="${vehiculoId}">
                <td>
                    <div class="vehicle-thumb" ${imgUrl ? `onclick="verImagenGrande('${imgUrl}', '${escapeHtml(v.marca)} ${escapeHtml(v.modelo)}')" style="cursor:pointer;"` : ''}>
                        ${imgUrl
                            ? `<img src="${imgUrl}" alt="${escapeHtml(v.marca)}" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'no-image\\'><svg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg></div>';">`
                            : `<div class="no-image"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}
                    </div>
                </td>
                <td><strong>${escapeHtml(v.marca)} ${escapeHtml(v.modelo)}</strong></td>
                <td>${precioFormateado}</td>
                <td>${escapeHtml(v.matricula) || 'N/A'}</td>
                <td>${v.anyo || v.anio || 'N/A'}</td>
                <td class="acciones-cell">
                    <button onclick="verVehiculo(${vehiculoId})" class="btn-icon btn-view" title="Ver detalles">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button onclick="abrirModalEditar(${vehiculoId})" class="btn-icon btn-edit" title="Editar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button onclick="eliminarVehiculo(${vehiculoId})" class="btn-icon btn-delete" title="Eliminar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
};

const escapeHtml = (text) => {
    if (text === null || text === undefined) return '-';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/* ============================================================
   VER VEHÍCULO (solo lectura)
   ============================================================ */
const verVehiculo = (id) => {
    const v = vehiculosCache.find(v => v.id == id);
    if (!v) {
        mostrarNotificacion('Vehículo no encontrado', 'error');
        return;
    }

    let imgUrl = null;
    if (v.imagen) {
        if (v.imagen.startsWith('data:')) imgUrl = v.imagen;
        else if (v.imagen.startsWith('/')) imgUrl = `http://localhost:8088${v.imagen}`;
        else if (v.imagen.startsWith('http')) imgUrl = v.imagen;
        else imgUrl = `http://localhost:8088/uploads/vehiculo/${v.imagen}`;
    }

    const precio = v.precio
        ? parseFloat(v.precio).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
        : 'N/A';

    const tipoLabel = {
        sedan: 'Sedán',
        suv: 'SUV',
        deportivo: 'Deportivo',
        electrico: 'Eléctrico',
        coupe: 'Coupé'
    };

    document.getElementById('verImagen').innerHTML = imgUrl
        ? `<img src="${imgUrl}" alt="${escapeHtml(v.marca)} ${escapeHtml(v.modelo)}"
               style="width:100%;height:220px;object-fit:cover;border-radius:6px;"
               onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:80px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.2);\\'><svg width=\\'48\\' height=\\'48\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg></div>'">`
        : `<div style="width:100%;height:80px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.15);">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                   <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
               </svg>
           </div>`;

    document.getElementById('verMarca').textContent     = v.marca || '-';
    document.getElementById('verModelo').textContent    = v.modelo || '-';
    document.getElementById('verTipo').textContent      = tipoLabel[v.categoria || v.tipo] || v.categoria || v.tipo || '-';
    document.getElementById('verAnio').textContent      = v.anyo || v.anio || '-';
    document.getElementById('verPrecio').textContent    = precio;
    document.getElementById('verMatricula').textContent = v.matricula || '-';
    document.getElementById('verDescripcion').textContent = v.descripcion || 'Sin descripción.';

    document.getElementById('modalVer').classList.add('active');
    document.body.style.overflow = 'hidden';
};

const cerrarModalVer = () => {
    document.getElementById('modalVer').classList.remove('active');
    document.body.style.overflow = '';
};

/* ============================================================
   CREAR VEHÍCULO (CORREGIDO - IMAGEN SE SUBE DESPUÉS DE CREAR)
   ============================================================ */

/* ============================================================
   VALIDACIÓN EN TIEMPO REAL
   ============================================================ */

const VALIDACIONES = {
    ofertaMarca:      { fn: v => v !== '',                               msg: 'Selecciona una marca' },
    ofertaModelo:     { fn: v => v.trim().length >= 2,                   msg: 'Mínimo 2 caracteres' },
    ofertaTipo:       { fn: v => v !== '',                               msg: 'Selecciona un tipo' },
    ofertaAnio:       { fn: v => /^(202[0-6])$/.test(v.trim()),          msg: 'Año entre 2020 y 2026' },
    ofertaPrecio:     { fn: v => parseFloat(v) > 0,                      msg: 'Precio mayor que 0' },
    ofertaMatricula:  { fn: v => /^[0-9]{4}[A-Za-z]{3}$/.test(v.replace(/[\s-]/g, '')), msg: 'Formato: 1234 ABC (4 números + 3 letras)' },
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

    let errEl = el.parentElement.querySelector('.campo-error');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'campo-error';
        el.parentElement.appendChild(errEl);
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
    const btn = document.querySelector('#ofertaForm .btn-submit');
    if (!btn) return;

    const total = Object.keys(VALIDACIONES).length;
    const validos = Object.values(estadoValidacion).filter(v => v === true).length;
    const todosValidos = validos === total;

    btn.disabled = !todosValidos;
    btn.style.opacity = todosValidos ? '1' : '0.45';
    btn.style.cursor = todosValidos ? 'pointer' : 'not-allowed';

    const bar = document.getElementById('formProgressBar');
    if (bar) {
        bar.style.width = `${Math.round((validos / total) * 100)}%`;
    }
}

function formatearMatricula(e) {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 4) {
        val = val.slice(0, 4) + ' ' + val.slice(4, 7);
    }
    e.target.value = val;
    validarCampo('ofertaMatricula');
}

function setupValidacionTiempoReal() {
    Object.keys(VALIDACIONES).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        estadoValidacion[id] = false;

        const evento = (el.tagName === 'SELECT') ? 'change' : 'input';

        if (id === 'ofertaMatricula') {
            el.addEventListener('input', formatearMatricula);
        } else {
            el.addEventListener(evento, () => validarCampo(id));
        }

        el.addEventListener('blur', () => {
            if (el.value !== '' || el.tagName === 'SELECT') {
                validarCampo(id);
            }
        });
    });

    actualizarBotonSubmit();
}

function resetValidaciones() {
    Object.keys(VALIDACIONES).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('campo-valido', 'campo-invalido');
        estadoValidacion[id] = false;
        const errEl = el.parentElement.querySelector('.campo-error');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    });
    actualizarBotonSubmit();
}

let creandoVehiculo = false;

async function crearOfertaComercial(e) {
    e.preventDefault();

    if (creandoVehiculo) {
        console.log('Ya se está creando un vehículo, ignorando doble clic');
        return;
    }
    creandoVehiculo = true;

    const btnSubmit = e.target.querySelector('.btn-submit');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Publicando...';
    }

    const user = getCurrentUser();
    if (!user) {
        mostrarNotificacion('Debes iniciar sesión', 'error');
        creandoVehiculo = false;
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = '+ PUBLICAR VEHÍCULO';
        }
        return;
    }

    const matricula = document.getElementById('ofertaMatricula').value.trim().toUpperCase();
    const existe = vehiculosCache.some(v => v.matricula === matricula);
    if (existe) {
        mostrarNotificacion('Ya existe un vehículo con esa matrícula', 'error');
        creandoVehiculo = false;
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = '+ PUBLICAR VEHÍCULO';
        }
        return;
    }

    const vehiculoData = {
        matricula: matricula,
        marca: document.getElementById('ofertaMarca').value,
        modelo: document.getElementById('ofertaModelo').value.trim(),
        categoria: document.getElementById('ofertaTipo').value,
        anyo: parseInt(document.getElementById('ofertaAnio').value),
        precio: parseFloat(document.getElementById('ofertaPrecio').value),
        descripcion: document.getElementById('ofertaDescripcion').value.trim()
    };

    try {
        const nuevoVehiculo = await apiFetch(`${API_BASE}/vehiculos`, {
            method: 'POST',
            body: JSON.stringify(vehiculoData)
        });

        if (!nuevoVehiculo || !nuevoVehiculo.id) {
            throw new Error('El backend no devolvió ID del vehículo');
        }

        const vehiculoId = nuevoVehiculo.id;
        console.log('Vehículo creado con ID:', vehiculoId);

        if (currentImageFile) {
            console.log('Subiendo imagen:', currentImageFile.name);
            await subirImagenMultipart(vehiculoId, currentImageFile);
        }

        mostrarNotificacion('Vehículo publicado correctamente', 'success');
        e.target.reset();
        removeImage();
        resetValidaciones();

    } catch (error) {
        console.error('Error completo:', error);
        mostrarNotificacion('Error al publicar: ' + error.message, 'error');
    } finally {
        creandoVehiculo = false;
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = '+ PUBLICAR VEHÍCULO';
        }
        await loadVehiculos();
    }
}
/* ============================================================
   EDITAR VEHÍCULO
   ============================================================ */
let currentImageFile = null;
let currentEditImageFile = null;

const abrirModalEditar = async (id) => {
    console.log('Abriendo modal editar para ID:', id);

    try {
        const vehiculo = vehiculosCache.find(v => v.id == id);

        if (!vehiculo) {
            console.error('Vehículo no encontrado en cache. ID:', id);
            mostrarNotificacion('Error: Vehículo no encontrado', 'error');
            return;
        }

        console.log('Vehículo encontrado:', vehiculo);
        vehiculoEditandoId = id;

        document.getElementById('editId').value = vehiculo.id;
        document.getElementById('editMarca').value = vehiculo.marca || '';
        document.getElementById('editModelo').value = vehiculo.modelo || '';
        document.getElementById('editTipo').value = vehiculo.categoria || vehiculo.tipo || '';
        document.getElementById('editAnio').value = vehiculo.anyo || vehiculo.anio || '';
        document.getElementById('editPrecio').value = vehiculo.precio || '';
        document.getElementById('editMatricula').value = vehiculo.matricula || '';
        document.getElementById('editDescripcion').value = vehiculo.descripcion || '';

        currentEditImageFile = null;
        const preview = document.getElementById('editImagePreview');
        const placeholder = document.getElementById('editImagePlaceholder');
        const btnRemove = document.getElementById('editBtnRemoveImage');

        if (vehiculo.imagen) {
            let src;
            if (vehiculo.imagen.startsWith('data:')) src = vehiculo.imagen;
            else if (vehiculo.imagen.startsWith('/')) src = `http://localhost:8088${vehiculo.imagen}`;
            else if (vehiculo.imagen.startsWith('http')) src = vehiculo.imagen;
            else src = `http://localhost:8088/uploads/vehiculo/${vehiculo.imagen}`;

            if (preview) {
                preview.src = src;
                preview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            if (btnRemove) btnRemove.style.display = 'flex';
        } else {
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'flex';
            if (btnRemove) btnRemove.style.display = 'none';
        }

        document.getElementById('modalEditar').classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Modal abierto');

    } catch (error) {
        mostrarNotificacion('Error al cargar vehículo', 'error');
        console.error(error);
    }
};

const cerrarModalEditar = () => {
    document.getElementById('modalEditar').classList.remove('active');
    vehiculoEditandoId = null;
    currentEditImageFile = null;
    document.body.style.overflow = '';

    const preview = document.getElementById('editImagePreview');
    const placeholder = document.getElementById('editImagePlaceholder');
    const btnRemove = document.getElementById('editBtnRemoveImage');

    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'flex';
    if (btnRemove) btnRemove.style.display = 'none';
};

const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!vehiculoEditandoId) {
        mostrarNotificacion('Error: No hay vehículo para editar', 'error');
        return;
    }

    const datos = {
        marca: document.getElementById('editMarca').value,
        modelo: document.getElementById('editModelo').value.trim(),
        categoria: document.getElementById('editTipo').value,
        anyo: parseInt(document.getElementById('editAnio').value),
        precio: parseFloat(document.getElementById('editPrecio').value),
        matricula: document.getElementById('editMatricula').value.trim().toUpperCase(),
        descripcion: document.getElementById('editDescripcion').value.trim()
    };

    if (!datos.marca || !datos.modelo || !datos.matricula) {
        mostrarNotificacion('Rellena los campos obligatorios', 'error');
        return;
    }

    try {
        await apiFetch(`${API_BASE}/vehiculos/${vehiculoEditandoId}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });

        if (currentEditImageFile) {
            await reemplazarImagenMultipart(vehiculoEditandoId, currentEditImageFile);
        }

        cerrarModalEditar();
        mostrarNotificacion('Vehículo actualizado correctamente', 'success');
        await loadVehiculos();

    } catch (error) {
        mostrarNotificacion('Error al actualizar. Guardando localmente.', 'warning');

        const vehiculos = getVehiculos();
        const idx = vehiculos.findIndex(v => v.id == vehiculoEditandoId);
        if (idx !== -1) {
            vehiculos[idx] = { ...vehiculos[idx], ...datos };
            saveVehiculos(vehiculos);
        }
        cerrarModalEditar();
        loadVehiculos();
    }
};

/* ============================================================
   ELIMINAR VEHÍCULO
   ============================================================ */
const eliminarVehiculo = async (id) => {
    if (!confirm('¿Eliminar este vehículo permanentemente?')) return;

    try {
        await apiFetch(`${API_BASE}/vehiculos/${id}`, {
            method: 'DELETE'
        });

        mostrarNotificacion('Vehículo eliminado correctamente', 'success');
        await loadVehiculos();

    } catch (error) {
        mostrarNotificacion('Error al eliminar. Eliminando localmente.', 'warning');

        const vehiculos = getVehiculos().filter(v => v.id != id);
        saveVehiculos(vehiculos);
        loadVehiculos();
    }
};

/* ============================================================
   IMAGENES
   ============================================================ */
function handleImageSelect(event) {
    if (event.target.files && event.target.files[0]) {
        processImageFile(event.target.files[0]);
    }
}

function processImageFile(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
        mostrarNotificacion('Solo JPG, PNG o WebP', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('Máximo 5MB', 'error');
        return;
    }

    currentImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        const placeholder = document.getElementById('imagePlaceholder');
        const preview = document.getElementById('imagePreview');
        const btnRemove = document.getElementById('btnRemoveImage');

        if (placeholder) placeholder.style.display = 'none';
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        if (btnRemove) btnRemove.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    currentImageFile = null;
    const input = document.getElementById('ofertaImagen');
    if (input) input.value = '';

    const placeholder = document.getElementById('imagePlaceholder');
    const preview = document.getElementById('imagePreview');
    const btnRemove = document.getElementById('btnRemoveImage');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (btnRemove) btnRemove.style.display = 'none';
}

function handleEditImageSelect(event) {
    if (event.target.files && event.target.files[0]) {
        processEditImageFile(event.target.files[0]);
    }
}

function processEditImageFile(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
        mostrarNotificacion('Solo JPG, PNG o WebP', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        mostrarNotificacion('Máximo 2MB', 'error');
        return;
    }

    currentEditImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        const placeholder = document.getElementById('editImagePlaceholder');
        const preview = document.getElementById('editImagePreview');
        const btnRemove = document.getElementById('editBtnRemoveImage');

        if (placeholder) placeholder.style.display = 'none';
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        if (btnRemove) btnRemove.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeEditImage() {
    currentEditImageFile = null;
    const input = document.getElementById('editImagen');
    if (input) input.value = '';

    const placeholder = document.getElementById('editImagePlaceholder');
    const preview = document.getElementById('editImagePreview');
    const btnRemove = document.getElementById('editBtnRemoveImage');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (btnRemove) btnRemove.style.display = 'none';
}

/* ============================================================
   SUBIR IMAGEN MULTIPART (CORREGIDO - MEJOR MANEJO DE ERRORES)
   ============================================================ */
async function subirImagenMultipart(vehiculoId, file) {
    try {
        const formData = new FormData();
        formData.append('file', file, file.name);

        console.log('Enviando imagen a:', `${API_BASE}/vehiculos/${vehiculoId}/imagenes`);
        console.log('Archivo:', file.name, 'Tamaño:', file.size);

        const res = await fetch(`${API_BASE}/vehiculos/${vehiculoId}/imagenes`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const resultado = await res.json();
        console.log('Imagen subida correctamente:', resultado);
        mostrarNotificacion('Imagen subida correctamente', 'success');
        return true;
    } catch (err) {
        console.error('Error subiendo imagen:', err);
        mostrarNotificacion('Error al subir imagen: ' + err.message, 'error');
        return false;
    }
}

async function reemplazarImagenMultipart(vehiculoId, file) {
    try {
        const formData = new FormData();
        formData.append('file', file, file.name);

        console.log('Reemplazando imagen en:', `${API_BASE}/vehiculos/${vehiculoId}/imagenes`);

        const res = await fetch(`${API_BASE}/vehiculos/${vehiculoId}/imagenes`, {
            method: 'PUT',
            credentials: 'include',
            body: formData
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const resultado = await res.json();
        console.log('Imagen actualizada:', resultado);
        mostrarNotificacion('Imagen actualizada correctamente', 'success');
        return true;
    } catch (err) {
        console.error('Error actualizando imagen:', err);
        mostrarNotificacion('Error al actualizar imagen: ' + err.message, 'error');
        return false;
    }
}

function verImagenGrande(src, alt) {
    if (!src) return;
    const existing = document.querySelector('.img-modal-overlay');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'img-modal-overlay';
    modal.innerHTML = `<img src="${src}" alt="${escapeHtml(alt)}"/>`;
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

/* ============================================================
   LOCALSTORAGE FALLBACK
   ============================================================ */
function getVehiculos() {
    try {
        return JSON.parse(localStorage.getItem('vehiculos')) || [];
    } catch { return []; }
}

function saveVehiculos(lista) {
    localStorage.setItem('vehiculos', JSON.stringify(lista));
}

function initData() {
    if (!localStorage.getItem('vehiculos')) {
        localStorage.setItem('vehiculos', JSON.stringify([]));
    }
}

/* ============================================================
   NOTIFICACIONES
   ============================================================ */
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notif = document.createElement('div');
    notif.className = `notificacion notificacion-${tipo}`;
    notif.textContent = mensaje;

    const bgColor = tipo === 'error' ? '#ef4444' : tipo === 'warning' ? '#f59e0b' : tipo === 'success' ? '#10b981' : '#3b82f6';
    notif.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 14px 24px;
        border-radius: 8px;
        color: #fff;
        font-weight: 500;
        font-size: 0.9rem;
        z-index: 99999;
        background: ${bgColor};
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        animation: slideUp 0.3s ease;
        font-family: var(--font-sans);
    `;

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
};

/* ============================================================
   DRAG & DROP (AÑADIDO - ANTES FALTABA Y DABA ERROR)
   ============================================================ */
function setupDragAndDrop() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('ofertaImagen');
    
    if (!dropArea || !fileInput) {
        console.log('Drop area o file input no encontrados para crear');
        return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('drag-over'), false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            processImageFile(files[0]);
        }
    }
}

function setupEditDragAndDrop() {
    const dropArea = document.getElementById('edit-drop-area');
    const fileInput = document.getElementById('editImagen');
    
    if (!dropArea || !fileInput) {
        console.log('Drop area o file input no encontrados para editar');
        return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('drag-over'), false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            processEditImageFile(files[0]);
        }
    }
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAuth === 'function') {
        checkAuth(['comercial', 'admin']);
    }

    loadVehiculos();

    // Formulario crear
    const formCrear = document.getElementById('ofertaForm');
    if (formCrear) formCrear.addEventListener('submit', crearOfertaComercial);

    // Formulario editar
    const formEditar = document.getElementById('formEditarVehiculo');
    if (formEditar) formEditar.addEventListener('submit', guardarEdicion);

    // Modal editar — click fuera
    const modalEditar = document.getElementById('modalEditar');
    if (modalEditar) {
        modalEditar.addEventListener('click', (e) => {
            if (e.target === modalEditar) cerrarModalEditar();
        });
    }

    // Modal ver — click fuera
    const modalVer = document.getElementById('modalVer');
    if (modalVer) {
        modalVer.addEventListener('click', (e) => {
            if (e.target === modalVer) cerrarModalVer();
        });
    }

    // Escape para cerrar cualquier modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalEditar();
            cerrarModalVer();
        }
    });

    // Nombre usuario
    const currentUser = getCurrentUser();
    const userNameEl = document.getElementById('userName');
    if (currentUser && userNameEl) {
        userNameEl.textContent = currentUser.nombre || currentUser.email || 'Comercial';
    }

    // Botón "Volver al Admin" si se entró por impersonación
    const btnVolver = document.getElementById('btnVolverAdmin');
    if (btnVolver && localStorage.getItem('adminSession')) {
        btnVolver.style.display = 'block';
    }

    // Validación tiempo real
    setupValidacionTiempoReal();

    // Drag & drop (AHORA SÍ DEFINIDAS, NO DARÁ ERROR)
    setupDragAndDrop();
    setupEditDragAndDrop();
});