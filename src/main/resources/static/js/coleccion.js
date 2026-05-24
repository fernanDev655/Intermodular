/* ============================================================
   COLECCION.JS — AutoElite Catálogo Público (v4 — Marcas Premium)
   Spring Boot API Integration · http://localhost:8088
   ============================================================ */

const API_BASE = 'http://localhost:8088';
const PRECIO_MAX_DEFAULT = 10000000; // 10 millones

// Marcas premium hardcodeadas para el filtro (siempre visibles)
const MARCAS_PREMIUM = [
    'Audi', 'Bentley', 'BMW', 'Ferrari', 'Jaguar',
    'Lamborghini', 'Lexus', 'Mercedes', 'Porsche', 'Rolls-Royce'
];

let todosLosVehiculos = [];
let filtrosActuales = {
    marca: '',
    tipo: '',
    precioMin: 0,
    precioMax: PRECIO_MAX_DEFAULT,
    anioMin: '',
    anioMax: ''
};

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initData();
    initNavSession();
    initSliders();
    initSelectListeners();
    cargarVehiculosColeccion();
});

function initNavSession() {
    const user = getCurrentUser();
    if (user) {
        const linkLogin = document.getElementById('linkLogin');
        const btnLogout = document.getElementById('btnLogout');
        if (linkLogin) linkLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'inline-block';
    }
}

function initSliders() {
    const sliderMin = document.getElementById('filtroPrecioMin');
    const sliderMax = document.getElementById('filtroPrecioMax');
    if (!sliderMin || !sliderMax) return;

    sliderMin.max = PRECIO_MAX_DEFAULT;
    sliderMin.step = 100000;
    sliderMin.value = 0;

    sliderMax.max = PRECIO_MAX_DEFAULT;
    sliderMax.step = 100000;
    sliderMax.value = PRECIO_MAX_DEFAULT;

    sliderMin.addEventListener('input', () => sincronizarSliders('min'));
    sliderMax.addEventListener('input', () => sincronizarSliders('max'));

    actualizarLabelPrecio('min', 0);
    actualizarLabelPrecio('max', PRECIO_MAX_DEFAULT);
}

function initSelectListeners() {
    ['filtroMarca', 'filtroTipo', 'filtroAnioMin', 'filtroAnioMax'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', aplicarFiltrosColeccion);
    });
}

/* ============================================================
   AUTENTICACIÓN / SESIÓN
   ============================================================ */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch { return null; }
}

function logout() {
    fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
}

/* ============================================================
   CARGAR VEHÍCULOS — API SPRING BOOT
   ============================================================ */
async function cargarVehiculosColeccion() {
    try {
        const response = await fetch(`${API_BASE}/api/vehiculos`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 401) {
            console.error('No autorizado: Redirigiendo a login');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        todosLosVehiculos = await response.json();

        console.log('Vehículos cargados:', todosLosVehiculos);

        const marcaGuardada = filtrosActuales.marca;
        const tipoGuardado = filtrosActuales.tipo;

        poblarSelectMarca();
        poblarSelectTipo(todosLosVehiculos);

        if (marcaGuardada) {
            const selectMarca = document.getElementById('filtroMarca');
            if (selectMarca) selectMarca.value = marcaGuardada;
        }
        if (tipoGuardado) {
            const selectTipo = document.getElementById('filtroTipo');
            if (selectTipo) selectTipo.value = tipoGuardado;
        }

        aplicarFiltrosColeccion();

    } catch (error) {
        console.warn('API no disponible, usando caché local:', error);
        todosLosVehiculos = getVehiculosFallback();
        poblarSelectMarca();
        poblarSelectTipo(todosLosVehiculos);
        aplicarFiltrosColeccion();
    }
}

/* ============================================================
   POBLAR SELECTS
   ============================================================ */
function poblarSelectMarca() {
    const select = document.getElementById('filtroMarca');
    if (!select) return;

    // Usar MARCAS_PREMIUM hardcodeadas, ordenadas alfabéticamente
    const marcas = [...MARCAS_PREMIUM].sort((a, b) => 
        a.localeCompare(b, 'es', { sensitivity: 'base' })
    );

    select.innerHTML = '<option value="">Todas las marcas</option>';
    marcas.forEach(marca => {
        const opt = document.createElement('option');
        opt.value = marca;
        opt.textContent = marca;
        select.appendChild(opt);
    });
}

function poblarSelectTipo(vehiculos) {
    const select = document.getElementById('filtroTipo');
    if (!select) return;

    const tiposSet = new Set();
    vehiculos.forEach(v => {
        const cat = v.categoria || v.tipo;
        if (cat && typeof cat === 'string') {
            tiposSet.add(cat.trim());
        }
    });
    const tipos = [...tiposSet].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    select.innerHTML = '<option value="">Todos los tipos</option>';
    tipos.forEach(tipo => {
        const opt = document.createElement('option');
        opt.value = tipo;
        opt.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        select.appendChild(opt);
    });
}

/* ============================================================
   HELPER: URL DE IMAGEN
   ============================================================ */
function buildImageUrl(imagen) {
    if (!imagen) return null;
    if (imagen.startsWith('data:')) return imagen;
    if (imagen.startsWith('http')) return imagen;
    const cleanPath = imagen.replace(/^\//, '');
    return `${API_BASE}/${cleanPath}`;
}

/* ============================================================
   RENDERIZAR GRID
   ============================================================ */
function renderVehiculosColeccion(vehiculos) {
    const grid      = document.getElementById('vehiculosGrid');
    const noResults = document.getElementById('noResults');
    if (!grid) return;

    if (!vehiculos || vehiculos.length === 0) {
        grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';

    grid.innerHTML = vehiculos.map((v, i) => {
        let imgHtml = '<div class="vp-img-fallback">🚗</div>';

        if (v.imagen) {
            const imgUrl = buildImageUrl(v.imagen);
            imgHtml = `<img
                src="${imgUrl}"
                alt="${v.marca} ${v.modelo}"
                style="width:100%;height:100%;object-fit:cover;display:block;"
                onerror="handleImageError(this)">`;
        }

        const specs = [];
        const categoriaDisplay = v.categoria || v.tipo || '';
        if (categoriaDisplay) specs.push({ icon: 'car',      text: categoriaDisplay });
        if (v.anyo || v.anio)      specs.push({ icon: 'calendar', text: v.anyo || v.anio });
        if (v.matricula)           specs.push({ icon: 'id',       text: v.matricula });

        const precio = parseFloat(v.precio);
        const precioFormateado = isNaN(precio)
            ? 'Consultar'
            : precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

        return `
        <div class="vehiculo-premium-card" style="animation-delay:${i * 0.05}s">
            <span class="vp-badge-disponible">Disponible</span>
            <div class="vp-image">
                ${imgHtml}
            </div>
            <div class="vp-content">
                <div class="vp-brand">${v.marca || 'Sin marca'}</div>
                <h3 class="vp-title">${v.modelo || 'Sin modelo'}</h3>
                <div class="vp-specs">
                    ${specs.map(s => `
                        <span class="vp-spec">
                            ${svgSpec(s.icon)}
                            ${s.text}
                        </span>`).join('')}
                </div>
                <p class="vp-desc">${v.descripcion || 'Vehículo de lujo en excelentes condiciones.'}</p>
                <div class="vp-footer">
                    <span class="vp-price">${precioFormateado}</span>
                    <a href="#" class="vp-btn" onclick="mostrarDetalle(${v.id}); return false;">
                        Ver detalles
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>`;
    }).join('');
}

function svgSpec(icon) {
    const icons = {
        car:      '<path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2m-8 0h6m-7-5a1 1 0 1 0 2 0 1 1 0 0 0-2 0m6 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        id:       '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'
    };
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[icon] || ''}</svg>`;
}

/* ============================================================
   ERROR DE IMAGEN
   ============================================================ */
function handleImageError(imgElement) {
    console.warn('Error cargando imagen:', imgElement.src);
    const parent = imgElement.parentElement;
    if (parent) parent.innerHTML = '<div class="vp-img-fallback">🚗</div>';
}

/* ============================================================
   SLIDERS DE PRECIO — 10 MILLONES
   ============================================================ */
function sincronizarSliders(tipo) {
    const sliderMin = document.getElementById('filtroPrecioMin');
    const sliderMax = document.getElementById('filtroPrecioMax');
    if (!sliderMin || !sliderMax) return;

    let min = parseInt(sliderMin.value);
    let max = parseInt(sliderMax.value);

    if (tipo === 'min' && min > max) { sliderMin.value = max; min = max; }
    if (tipo === 'max' && max < min) { sliderMax.value = min; max = min; }

    actualizarLabelPrecio('min', min);
    actualizarLabelPrecio('max', max);

    aplicarFiltrosColeccion();
}

function actualizarLabelPrecio(tipo, valor) {
    const id    = tipo === 'min' ? 'precioMinLabel' : 'precioMaxLabel';
    const label = document.getElementById(id);
    if (label) {
        const num = parseInt(valor);
        if (num >= 1000000) {
            const millones = (num / 1000000).toFixed(1).replace(/\.0$/, '');
            label.textContent = `€ ${millones}M`;
        } else if (num >= 1000) {
            label.textContent = '€ ' + num.toLocaleString('es-ES');
        } else {
            label.textContent = '€ ' + num;
        }
    }
}

/* ============================================================
   APLICAR FILTROS
   ============================================================ */
function aplicarFiltrosColeccion() {
    const elMarca     = document.getElementById('filtroMarca');
    const elTipo      = document.getElementById('filtroTipo');
    const elPrecioMin = document.getElementById('filtroPrecioMin');
    const elPrecioMax = document.getElementById('filtroPrecioMax');
    const elAnioMin   = document.getElementById('filtroAnioMin');
    const elAnioMax   = document.getElementById('filtroAnioMax');

    const marcaRaw     = elMarca ? elMarca.value : '';
    const tipoRaw      = elTipo ? elTipo.value : '';
    const precioMin = elPrecioMin ? parseInt(elPrecioMin.value) || 0 : 0;
    const precioMax = elPrecioMax ? parseInt(elPrecioMax.value) || PRECIO_MAX_DEFAULT : PRECIO_MAX_DEFAULT;
    const anioMin   = elAnioMin ? elAnioMin.value : '';
    const anioMax   = elAnioMax ? elAnioMax.value : '';

    filtrosActuales = { marca: marcaRaw, tipo: tipoRaw, precioMin, precioMax, anioMin, anioMax };

    console.log('Filtros aplicados:', filtrosActuales);

    let vehiculos = [...todosLosVehiculos];

    if (marcaRaw && marcaRaw.trim() !== '') {
        vehiculos = vehiculos.filter(v => {
            const vehiculoMarca = (v.marca || '').trim();
            return vehiculoMarca === marcaRaw.trim();
        });
    }

    if (tipoRaw && tipoRaw.trim() !== '') {
        vehiculos = vehiculos.filter(v => {
            const vehiculoTipo = (v.categoria || v.tipo || '').trim();
            return vehiculoTipo === tipoRaw.trim();
        });
    }

    vehiculos = vehiculos.filter(v => {
        const p = parseFloat(v.precio);
        if (isNaN(p)) return true;
        return p >= precioMin && p <= precioMax;
    });

    if (anioMin && anioMin !== '') {
        vehiculos = vehiculos.filter(v => {
            const anio = parseInt(v.anyo || v.anio);
            return !isNaN(anio) && anio >= parseInt(anioMin);
        });
    }

    if (anioMax && anioMax !== '') {
        vehiculos = vehiculos.filter(v => {
            const anio = parseInt(v.anyo || v.anio);
            return !isNaN(anio) && anio <= parseInt(anioMax);
        });
    }

    console.log('Resultados filtrados:', vehiculos.length);
    renderVehiculosColeccion(vehiculos);
    actualizarContador(vehiculos.length);
    mostrarFiltrosActivos(filtrosActuales);
}

/* ============================================================
   FILTROS ACTIVOS (chips)
   ============================================================ */
function mostrarFiltrosActivos({ marca, tipo, precioMin, precioMax, anioMin, anioMax }) {
    const container = document.getElementById('activeFilters');
    if (!container) return;

    const chips = [];
    if (marca && marca.trim() !== '')  chips.push({ label: marca,                                         action: 'marca'     });
    if (tipo && tipo.trim() !== '')    chips.push({ label: tipo.charAt(0).toUpperCase() + tipo.slice(1),  action: 'tipo'      });
    if (precioMin > 0)                 chips.push({ label: `Desde €${precioMin.toLocaleString('es-ES')}`, action: 'precioMin' });
    if (precioMax < PRECIO_MAX_DEFAULT) chips.push({ label: `Hasta €${precioMax.toLocaleString('es-ES')}`, action: 'precioMax' });
    if (anioMin && anioMin !== '')     chips.push({ label: `Desde ${anioMin}`,                            action: 'anioMin'   });
    if (anioMax && anioMax !== '')     chips.push({ label: `Hasta ${anioMax}`,                            action: 'anioMax'   });

    container.innerHTML = chips.map(c => `
        <span class="filter-chip" data-action="${c.action}" onclick="resetChip('${c.action}')">
            ${c.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </span>`).join('');
}

function resetChip(action) {
    const defaults = {
        marca:     '',
        tipo:      '',
        precioMin: 0,
        precioMax: PRECIO_MAX_DEFAULT,
        anioMin:   '',
        anioMax:   ''
    };
    const idMap = {
        marca:     'filtroMarca',
        tipo:      'filtroTipo',
        precioMin: 'filtroPrecioMin',
        precioMax: 'filtroPrecioMax',
        anioMin:   'filtroAnioMin',
        anioMax:   'filtroAnioMax'
    };
    const el = document.getElementById(idMap[action]);
    if (!el) return;
    el.value = defaults[action];
    if (action === 'precioMin') actualizarLabelPrecio('min', 0);
    if (action === 'precioMax') actualizarLabelPrecio('max', PRECIO_MAX_DEFAULT);
    aplicarFiltrosColeccion();
}

/* ============================================================
   RESET FILTROS
   ============================================================ */
function resetFiltros() {
    filtrosActuales = {
        marca: '',
        tipo: '',
        precioMin: 0,
        precioMax: PRECIO_MAX_DEFAULT,
        anioMin: '',
        anioMax: ''
    };

    const filtroMarca = document.getElementById('filtroMarca');
    const filtroTipo = document.getElementById('filtroTipo');
    const filtroPrecioMin = document.getElementById('filtroPrecioMin');
    const filtroPrecioMax = document.getElementById('filtroPrecioMax');
    const filtroAnioMin = document.getElementById('filtroAnioMin');
    const filtroAnioMax = document.getElementById('filtroAnioMax');

    if (filtroMarca) filtroMarca.value = '';
    if (filtroTipo) filtroTipo.value = '';
    if (filtroPrecioMin) filtroPrecioMin.value = 0;
    if (filtroPrecioMax) filtroPrecioMax.value = PRECIO_MAX_DEFAULT;
    if (filtroAnioMin) filtroAnioMin.value = '';
    if (filtroAnioMax) filtroAnioMax.value = '';

    actualizarLabelPrecio('min', 0);
    actualizarLabelPrecio('max', PRECIO_MAX_DEFAULT);

    const container = document.getElementById('activeFilters');
    if (container) container.innerHTML = '';

    renderVehiculosColeccion(todosLosVehiculos);
    actualizarContador(todosLosVehiculos.length);
}

/* ============================================================
   CONTADOR DE RESULTADOS
   ============================================================ */
function actualizarContador(count) {
    const el = document.getElementById('resultsCount');
    if (el) {
        el.textContent = count === 0
            ? 'Sin resultados'
            : `${count} vehículo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }
}

/* ============================================================
   MODAL DETALLE
   ============================================================ */
function mostrarDetalle(id) {
    const v = todosLosVehiculos.find(x => x.id === id);
    if (!v) return;

    const precio = parseFloat(v.precio);
    const precioTxt = isNaN(precio)
        ? 'Consultar precio'
        : precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

    const imgUrl = v.imagen ? buildImageUrl(v.imagen) : null;

    const specs = [];
    if (v.categoria || v.tipo) specs.push({ label: 'Tipo',        value: v.categoria || v.tipo });
    if (v.anyo || v.anio)     specs.push({ label: 'Año',         value: v.anyo || v.anio });
    if (v.matricula)          specs.push({ label: 'Matrícula',   value: v.matricula });
    if (v.kilometros)         specs.push({ label: 'Kilómetros',  value: parseInt(v.kilometros).toLocaleString('es-ES') + ' km' });
    if (v.combustible)        specs.push({ label: 'Combustible', value: v.combustible });
    if (v.transmision)        specs.push({ label: 'Transmisión', value: v.transmision });

    const modal = document.createElement('div');
    modal.id = 'vehiculoModal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-panel" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="cerrarModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="modal-image-wrap">
                    ${imgUrl
                        ? `<img src="${imgUrl}" alt="${v.marca} ${v.modelo}" onerror="this.parentElement.innerHTML='<div class=modal-img-fallback>🚗</div>'">`
                        : '<div class="modal-img-fallback">🚗</div>'
                    }
                </div>
                <div class="modal-body">
                    <div class="modal-brand">${v.marca || 'Sin marca'}</div>
                    <h2 class="modal-title">${v.modelo || 'Sin modelo'}</h2>
                    ${specs.length ? `
                    <div class="modal-specs-grid">
                        ${specs.map(s => `
                            <div class="modal-spec-item">
                                <span class="modal-spec-label">${s.label}</span>
                                <span class="modal-spec-value">${s.value}</span>
                            </div>`).join('')}
                    </div>` : ''}
                    ${v.descripcion ? `<p class="modal-desc">${v.descripcion}</p>` : ''}
                    <div class="modal-footer">
                        <span class="modal-price">${precioTxt}</span>
                        <button class="modal-cta" onclick="solicitarInfo(${v.id})">
                            Solicitar información
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.querySelector('.modal-overlay').classList.add('modal-visible'));
}

function cerrarModal() {
    const modal = document.getElementById('vehiculoModal');
    if (!modal) return;
    modal.querySelector('.modal-overlay').classList.remove('modal-visible');
    setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 300);
}

function solicitarInfo(id) {
    const v = todosLosVehiculos.find(x => x.id === id);
    if (v) mostrarToast(`Solicitud enviada para ${v.marca} ${v.modelo}`, 'success');
    cerrarModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

/* ============================================================
   FALLBACK localStorage
   ============================================================ */
function getVehiculosFallback() {
    try { return JSON.parse(localStorage.getItem('vehiculos')) || []; }
    catch { return []; }
}

function initData() {
    if (!localStorage.getItem('vehiculos')) {
        localStorage.setItem('vehiculos', JSON.stringify([]));
    }
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}