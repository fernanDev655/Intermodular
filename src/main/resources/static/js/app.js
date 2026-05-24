//js/app.js

// ============ UTILIDADES HTTP ============
function handleHttpError(status) {
    switch (status) {
        case 401:
            location.href = "/concesionario/login.html";
            break;
        case 403:
            location.href = "/concesionario/error/403.html";
            break;
        case 404:
            location.href = "/concesionario/error/404.html";
            break;
        default:
            location.href = "/concesionario/error/500.html";
    }
}

// ============ INICIALIZACIÓN DE DATOS ============
const initData = () => {
    if (!localStorage.getItem("initialized")) {
        const users = [
            {
                id: 1,
                nombre: "Admin Principal",
                email: "admin@autoelite.com",
                password: "admin123",
                rol: "admin",
                fecha: new Date().toISOString(),
            },
            {
                id: 2,
                nombre: "Juan Mecánico",
                email: "mecanico@autoelite.com",
                password: "mec123",
                rol: "mecanico",
                fecha: new Date().toISOString(),
            },
            {
                id: 3,
                nombre: "María Comercial",
                email: "comercial@autoelite.com",
                password: "com123",
                rol: "comercial",
                fecha: new Date().toISOString(),
            },
            {
                id: 4,
                nombre: "Cliente Demo",
                email: "cliente@demo.com",
                password: "cliente123",
                rol: "cliente",
                fecha: new Date().toISOString(),
            },
        ];

        const vehiculos = [
            {
                id: 1,
                marca: "BMW",
                modelo: "Serie 5",
                tipo: "sedan",
                anio: 2023,
                precio: 65000,
                enOferta: true,
                descuento: 10,
                descripcion: "Lujo y confort",
            },
            {
                id: 2,
                marca: "Mercedes",
                modelo: "GLE",
                tipo: "suv",
                anio: 2024,
                precio: 85000,
                enOferta: false,
                descuento: 0,
                descripcion: "SUV Premium",
            },
            {
                id: 3,
                marca: "Porsche",
                modelo: "911",
                tipo: "deportivo",
                anio: 2023,
                precio: 150000,
                enOferta: true,
                descuento: 5,
                descripcion: "Deportividad pura",
            },
        ];

        const reparaciones = [
            {
                id: 1,
                clienteId: 4,
                clienteNombre: "Cliente Demo",
                vehiculo: {
                    marca: "Audi",
                    modelo: "A4",
                    anio: 2020,
                    matricula: "1234ABC",
                },
                tipo: "mecanico",
                descripcion: "Ruido en el motor al arrancar",
                urgencia: "normal",
                estado: "pendiente",
                fecha: new Date().toISOString(),
                mecanicoId: null,
                presupuesto: null,
            },
        ];

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("vehiculos", JSON.stringify(vehiculos));
        localStorage.setItem("reparaciones", JSON.stringify(reparaciones));
        localStorage.setItem("initialized", "true");
    }
};

// ============ UTILIDADES LOCALSTORAGE ============
const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
const getVehiculos = () => JSON.parse(localStorage.getItem("vehiculos") || "[]");
const getReparaciones = () => JSON.parse(localStorage.getItem("reparaciones") || "[]");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const saveVehiculos = (v) => localStorage.setItem("vehiculos", JSON.stringify(v));
const saveReparaciones = (r) => localStorage.setItem("reparaciones", JSON.stringify(r));

// FUNCIÓN MEJORADA: Normaliza el usuario del backend al formato esperado
const getCurrentUser = () => {
    const raw = localStorage.getItem("currentUser");
    if (!raw || raw === "null") return null;
    
    try {
        const user = JSON.parse(raw);
        if (!user) return null;
        
        // Normalizar propiedades: backend usa 'role', 'correo' | frontend espera 'rol', 'email'
        return {
            ...user,
            id: user.id || user.userId || user.ID,
            nombre: user.nombre || user.name || user.Nombre || "Usuario",
            email: user.email || user.correo || user.Email || "",
            rol: ((user.rol || user.role || "cliente").toLowerCase() === "administrador" ? "admin" : (user.rol || user.role || "cliente").toLowerCase()),
        };
    } catch (e) {
        console.error("Error parseando currentUser:", e);
        return null;
    }
};

// ============ NAVEGACIÓN Y AUTH ============
const checkAuth = (rolesPermitidos = []) => {
    const user = getCurrentUser();
    if (!user) {
        console.warn("checkAuth: No hay usuario logueado, redirigiendo a login");
        window.location.href = "/concesionario/login.html";
        return;
    }

    const userRol = user.rol || "";
    const normalizedRoles = rolesPermitidos.map(r => (r || "").toLowerCase());

    if (rolesPermitidos.length > 0 && !normalizedRoles.includes(userRol)) {
        alert("No tienes permiso para acceder a esta sección");
        window.location.href = "/concesionario/index.html";
        return;
    }

    // Actualizar nombre en navbar
    const userNameEl = document.getElementById("userName");
    if (userNameEl) userNameEl.textContent = user.nombre;

    // Actualizar nombre específico en panel cliente
    const nombreClienteEl = document.getElementById("nombreCliente");
    if (nombreClienteEl) nombreClienteEl.textContent = user.nombre;
};

const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accesoEspecial");
    window.location.href = "/concesionario/index.html";
};

// ============ HANDLERS DE AUTENTICACIÓN ============
const handleRegister = (e) => {
    e.preventDefault();
    const nombre = document.getElementById("regNombre").value;
    const email = document.getElementById("regEmail").value;
    const telefono = document.getElementById("regTelefono").value;
    const password = document.getElementById("regPassword").value;
    const password2 = document.getElementById("regPassword2").value;

    if (password !== password2) {
        alert("Las contraseñas no coinciden");
        return;
    }

    const users = getUsers();
    if (users.find((u) => u.email === email)) {
        alert("Este correo ya está registrado");
        return;
    }

    const newUser = {
        id: Date.now(),
        nombre,
        email,
        telefono,
        password,
        rol: "cliente",
        fecha: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    window.location.href = "/concesionario/login.html";
};

const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const rolSelect = document.getElementById("loginRol");
    const rol = rolSelect && rolSelect.style.display !== "none" ? rolSelect.value : "cliente";

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
        alert("Credenciales incorrectas");
        return;
    }

    // Verificar rol si es acceso especial
    if (localStorage.getItem("accesoEspecial") === "true" && user.rol !== rol) {
        alert("Rol no coincide con sus credenciales");
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    // Redirigir según rol
    switch (user.rol) {
        case "admin":
            window.location.href = "/concesionario/admin.html";
            break;
        case "mecanico":
            window.location.href = "/concesionario/mecanico.html";
            break;
        case "comercial":
            window.location.href = "/concesionario/comercial.html";
            break;
        default:
            window.location.href = "/concesionario/cliente.html";
    }
};

// ============ FUNCIONES DEL CATÁLOGO ============
const renderVehiculos = (vehiculos) => {
    const grid = document.getElementById("vehiculosGrid");
    if (!grid) return;

    grid.innerHTML = vehiculos
        .map(
            (v) => `
        <div class="vehiculo-premium-card">
            <div class="vp-image">
                <div style="font-size: 4rem;">🚗</div>
            </div>
            <div class="vp-content">
                <div class="vp-brand">${v.marca}</div>
                <h3 class="vp-title">${v.modelo} ${v.anio}</h3>
                <div class="vp-specs">
                    <span class="vp-spec">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        ${v.tipo}
                    </span>
                    <span class="vp-spec">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${v.anio}
                    </span>
                </div>
                <div class="vp-footer">
                    <span class="vp-price">€${v.precio.toLocaleString()}</span>
                    <a href="#" class="vp-btn">Ver detalles →</a>
                </div>
            </div>
        </div>
    `
        )
        .join("");
};

const renderOfertas = (vehiculos) => {
    const grid = document.getElementById("ofertasGrid");
    if (!grid) return;

    const ofertas = vehiculos.filter((v) => v.enOferta);

    if (ofertas.length === 0) {
        grid.innerHTML =
            '<p style="color: rgba(255,255,255,0.5); text-align: center; width: 100%;">No hay ofertas disponibles</p>';
        return;
    }

    grid.innerHTML = ofertas
        .map(
            (v) => `
        <div class="oferta-card-premium">
            <span class="oferta-badge-premium">Oferta Especial</span>
            <div class="oferta-image"></div>
            <div class="oferta-info">
                <div class="oferta-meta">
                    <span>${v.marca}</span>
                    <span>${v.anio}</span>
                </div>
                <h3 class="oferta-title">${v.modelo}</h3>
                <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-top: 0.5rem;">${v.descripcion}</p>
                <div class="oferta-price-box">
                    <span class="oferta-old-price">€${v.precio.toLocaleString()}</span>
                    <span class="oferta-price">€${Math.round(
                        v.precio * (1 - v.descuento / 100)
                    ).toLocaleString()}</span>
                    <span class="oferta-discount">-${v.descuento}%</span>
                </div>
            </div>
        </div>
    `
        )
        .join("");
};

const scrollOfertas = (direction) => {
    const container = document.getElementById("ofertasGrid");
    if (container) {
        const scrollAmount = 420;
        container.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    }
};

const cargarMas = () => {
    alert("Función de carga dinámica - En producción cargaría más vehículos");
};

const aplicarFiltros = () => {
    const marca = document.getElementById("filtroMarca").value;
    const tipo = document.getElementById("filtroTipo").value;
    const precioMax = parseInt(document.getElementById("filtroPrecio").value);

    let vehiculos = getVehiculos();

    if (marca) vehiculos = vehiculos.filter((v) => v.marca.toLowerCase() === marca.toLowerCase());
    if (tipo) vehiculos = vehiculos.filter((v) => v.tipo === tipo);
    vehiculos = vehiculos.filter((v) => v.precio <= precioMax);

    renderVehiculos(vehiculos);
};

// ============ PANEL COMERCIAL ============
const crearOferta = (e) => {
    e.preventDefault();
    const vehiculo = {
        id: Date.now(),
        marca: document.getElementById("ofertaMarca").value,
        modelo: document.getElementById("ofertaModelo").value,
        tipo: document.getElementById("ofertaTipo").value,
        anio: parseInt(document.getElementById("ofertaAnio").value),
        precio: parseInt(document.getElementById("ofertaPrecio").value),
        enOferta: parseInt(document.getElementById("ofertaDescuento").value) > 0,
        descuento: parseInt(document.getElementById("ofertaDescuento").value) || 0,
        descripcion: document.getElementById("ofertaDescripcion").value,
        comercialId: getCurrentUser()?.id,
    };

    const vehiculos = getVehiculos();
    vehiculos.push(vehiculo);
    saveVehiculos(vehiculos);

    alert("Oferta publicada correctamente");
    loadOfertasComercial();
    e.target.reset();
};

const loadOfertasComercial = () => {
    const user = getCurrentUser();
    // PROTECCIÓN: Si no hay usuario, no cargar nada
    if (!user || !user.id) {
        console.warn("loadOfertasComercial: Usuario no logueado o sin ID");
        return;
    }
    
    const vehiculos = getVehiculos().filter((v) => v.comercialId === user.id);
    const tbody = document.querySelector("#tablaOfertas tbody");
    if (!tbody) return;

    tbody.innerHTML = vehiculos
        .map(
            (v) => `
        <tr>
            <td>${v.marca} ${v.modelo}</td>
            <td>€${v.precio.toLocaleString()}</td>
            <td>${v.descuento}%</td>
            <td><span class="estado-badge ${
                v.enOferta ? "estado-aprobado" : "estado-denegado"
            }">${v.enOferta ? "Activa" : "Inactiva"}</span></td>
            <td>
                <button onclick="toggleOferta(${
                    v.id
                })" class="btn btn-sm btn-secondary">
                    ${v.enOferta ? "Desactivar" : "Activar"}
                </button>
            </td>
        </tr>
    `
        )
        .join("");
};

const toggleOferta = (id) => {
    const vehiculos = getVehiculos();
    const v = vehiculos.find((x) => x.id === id);
    if (v) {
        v.enOferta = !v.enOferta;
        saveVehiculos(vehiculos);
        loadOfertasComercial();
    }
};

// ============ PANEL MECÁNICO ============
const loadEncargosMecanico = () => {
    const user = getCurrentUser();
    
    // PROTECCIÓN CRÍTICA: Verificar que hay usuario antes de continuar
    if (!user || !user.id) {
        console.warn("loadEncargosMecanico: No hay usuario logueado o falta ID", user);
        // No redirigir aquí para no crear bucles, solo salir silenciosamente
        // checkAuth ya debería haber redirigido si es necesario
        return;
    }
    
    const reparaciones = getReparaciones();

    // Disponibles (sin asignar)
    const disponibles = reparaciones.filter(
        (r) => r.estado === "pendiente" && !r.mecanicoId
    );
    renderEncargos(disponibles, "encargosDisponibles", true);

    // Asignados al mecánico
    const asignados = reparaciones.filter(
        (r) =>
            r.mecanicoId === user.id &&
            r.estado !== "completado" &&
            r.estado !== "denegado"
    );
    renderEncargos(asignados, "encargosAsignados", false);

    // Completados
    const completados = reparaciones.filter(
        (r) =>
            r.mecanicoId === user.id &&
            (r.estado === "completado" || r.estado === "denegado")
    );
    renderEncargos(completados, "encargosCompletados", false);
};

const renderEncargos = (lista, containerId, esDisponible) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML =
            '<p class="text-muted">No hay encargos en esta categoría</p>';
        return;
    }

    container.innerHTML = lista
        .map(
            (r) => `
        <div class="reparacion-card ${r.urgencia}">
            <div class="reparacion-header">
                <div>
                    <h4>${r.vehiculo.marca} ${r.vehiculo.modelo}</h4>
                    <small>${r.vehiculo.matricula} • ${r.clienteNombre}</small>
                </div>
                <span class="estado-badge estado-${r.estado}">${r.estado}</span>
            </div>
            <p><strong>Tipo:</strong> ${r.tipo}</p>
            <p>${r.descripcion}</p>
            ${
                r.presupuesto
                    ? `
                <div style="background:#f8f9fa; padding:1rem; margin-top:1rem; border-radius:4px;">
                    <strong>Presupuesto:</strong> €${r.presupuesto.coste}<br>
                    <strong>Tiempo:</strong> ${r.presupuesto.dias} días<br>
                    <small>${r.presupuesto.descripcion}</small>
                </div>
            `
                    : ""
            }
            ${
                esDisponible
                    ? `
                <button onclick="abrirPresupuesto(${r.id})" class="btn btn-primary" style="margin-top:1rem; width:100%;">
                    Gestionar Encargo
                </button>
            `
                    : ""
            }
            ${
                r.estado === "aprobado_cliente"
                    ? `
                <button onclick="completarReparacion(${r.id})" class="btn btn-success" style="margin-top:1rem; width:100%;">
                    Marcar como Completada
                </button>
            `
                    : ""
            }
        </div>
    `
        )
        .join("");
};

let currentReparacionId = null;

const abrirPresupuesto = (id) => {
    currentReparacionId = id;
    const r = getReparaciones().find((x) => x.id === id);
    const detalleEl = document.getElementById("detalleReparacion");
    const modalEl = document.getElementById("modalPresupuesto");
    
    if (!detalleEl || !modalEl || !r) return;
    
    detalleEl.innerHTML = `
        <p><strong>Vehículo:</strong> ${r.vehiculo.marca} ${r.vehiculo.modelo} (${r.vehiculo.matricula})</p>
        <p><strong>Problema:</strong> ${r.descripcion}</p>
    `;
    modalEl.classList.add("active");
};

const cerrarModal = () => {
    const modal = document.getElementById("modalPresupuesto");
    if (modal) modal.classList.remove("active");
};

const enviarPresupuesto = (e) => {
    e.preventDefault();
    const reparaciones = getReparaciones();
    const r = reparaciones.find((x) => x.id === currentReparacionId);

    if (r) {
        r.presupuesto = {
            coste: document.getElementById("costePresupuesto").value,
            dias: document.getElementById("tiempoEstimado").value,
            descripcion: document.getElementById("descripcionTrabajo").value,
        };
        r.estado = "presupuesto_enviado";
        r.mecanicoId = getCurrentUser()?.id;
        saveReparaciones(reparaciones);
        alert("Presupuesto enviado al cliente");
        cerrarModal();
        loadEncargosMecanico();
    }
};

const denegarEncargo = () => {
    const reparaciones = getReparaciones();
    const r = reparaciones.find((x) => x.id === currentReparacionId);
    if (r) {
        r.estado = "denegado";
        r.mecanicoId = getCurrentUser()?.id;
        saveReparaciones(reparaciones);
        alert("Encargo denegado");
        cerrarModal();
        loadEncargosMecanico();
    }
};

const completarReparacion = (id) => {
    const reparaciones = getReparaciones();
    const r = reparaciones.find((x) => x.id === id);
    if (r) {
        r.estado = "completado";
        r.fechaCompletado = new Date().toISOString();
        saveReparaciones(reparaciones);
        alert("Reparación marcada como completada");
        loadEncargosMecanico();
    }
};

const mostrarTab = (tab) => {
    document
        .querySelectorAll(".tab-content")
        .forEach((t) => t.classList.remove("active"));
    document
        .querySelectorAll(".tab-btn")
        .forEach((t) => t.classList.remove("active"));

    const tabId = "tab" + tab.charAt(0).toUpperCase() + tab.slice(1);
    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.classList.add("active");
    
    if (event && event.target) {
        event.target.classList.add("active");
    }
};

// ============ CLIENTE - SOLICITUD REPARACIÓN ============
const solicitarReparacion = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    
    if (!user || !user.id) {
        alert("Debes iniciar sesión para solicitar una reparación");
        return;
    }

    const reparacion = {
        id: Date.now(),
        clienteId: user.id,
        clienteNombre: user.nombre,
        vehiculo: {
            marca: document.getElementById("repMarca").value,
            modelo: document.getElementById("repModelo").value,
            anio: document.getElementById("repAnio").value,
            matricula: document.getElementById("repMatricula").value,
        },
        tipo: document.getElementById("repTipo").value,
        descripcion: document.getElementById("repDescripcion").value,
        urgencia: document.getElementById("repUrgencia").value,
        estado: "pendiente",
        fecha: new Date().toISOString(),
        mecanicoId: null,
        presupuesto: null,
    };

    const reparaciones = getReparaciones();
    reparaciones.push(reparacion);
    saveReparaciones(reparaciones);

    alert("Solicitud enviada correctamente. Un mecánico revisará tu caso.");
    window.location.href = "/concesionario/cliente.html";
};

const loadPanelCliente = () => {
    const user = getCurrentUser();
    
    if (!user || !user.id) {
        console.warn("loadPanelCliente: Usuario no logueado");
        return;
    }
    
    const reparaciones = getReparaciones().filter((r) => r.clienteId === user.id);
    const container = document.getElementById("misReparaciones");

    if (container) {
        if (reparaciones.length === 0) {
            container.innerHTML =
                '<p class="text-muted">No tienes reparaciones activas</p>';
        } else {
            container.innerHTML = reparaciones
                .map(
                    (r) => `
                <div style="border-bottom:1px solid #eee; padding:1rem 0;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>${r.vehiculo.marca} ${r.vehiculo.modelo}</strong>
                        <span class="estado-badge estado-${r.estado}">${r.estado.replace("_", " ")}</span>
                    </div>
                    <small>${new Date(r.fecha).toLocaleDateString()}</small>
                    ${
                        r.presupuesto && r.estado === "presupuesto_enviado"
                            ? `
                        <div style="margin-top:0.5rem; background:#f0f8ff; padding:0.5rem; border-radius:4px;">
                            <strong>Presupuesto recibido:</strong> €${r.presupuesto.coste}<br>
                            <button onclick="aceptarPresupuesto(${r.id})" class="btn btn-success btn-sm" style="margin-top:0.5rem;">Aceptar</button>
                            <button onclick="rechazarPresupuesto(${r.id})" class="btn btn-danger btn-sm" style="margin-top:0.5rem;">Rechazar</button>
                        </div>
                    `
                            : ""
                    }
                </div>
            `
                )
                .join("");
        }
    }
};

const aceptarPresupuesto = (id) => {
    const reparaciones = getReparaciones();
    const r = reparaciones.find((x) => x.id === id);
    if (r) {
        r.estado = "aprobado_cliente";
        saveReparaciones(reparaciones);
        alert("Presupuesto aceptado. El mecánico procederá con la reparación.");
        loadPanelCliente();
    }
};

const rechazarPresupuesto = (id) => {
    const reparaciones = getReparaciones();
    const r = reparaciones.find((x) => x.id === id);
    if (r) {
        r.estado = "rechazado_cliente";
        saveReparaciones(reparaciones);
        alert("Presupuesto rechazado");
        loadPanelCliente();
    }
};

// ============ ADMIN ============
const loadAdminData = () => {
    const users = getUsers();
    const vehiculos = getVehiculos();
    const reparaciones = getReparaciones();

    const statUsuarios = document.getElementById("statUsuarios");
    const statVehiculos = document.getElementById("statVehiculos");
    const statReparaciones = document.getElementById("statReparaciones");

    if (statUsuarios) statUsuarios.textContent = users.length;
    if (statVehiculos) statVehiculos.textContent = vehiculos.length;
    if (statReparaciones) statReparaciones.textContent = reparaciones.filter(
        (r) => r.estado !== "completado"
    ).length;

    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (tbody) {
        tbody.innerHTML = users
            .map(
                (u) => `
            <tr>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td><span class="estado-badge estado-${u.rol}">${u.rol}</span></td>
                <td>${new Date(u.fecha).toLocaleDateString()}</td>
                <td>
                    <button onclick="eliminarUsuario(${u.id})" class="btn btn-sm btn-danger">Eliminar</button>
                </td>
            </tr>
        `
            )
            .join("");
    }
};

const eliminarUsuario = (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    const users = getUsers().filter((u) => u.id !== id);
    saveUsers(users);
    loadAdminData();
};

// ============ TEMA ============
const toggleTheme = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
};

// ============ INICIALIZACIÓN GLOBAL ============
document.addEventListener("DOMContentLoaded", () => {
    initData();

    // Configurar navegación según rol
    const user = getCurrentUser();
    if (user) {
        const linkLogin = document.getElementById("linkLogin");
        const btnLogout = document.getElementById("btnLogout");
        const linkReparacion = document.getElementById("linkReparacion");
        const linkPanel = document.getElementById("linkPanel");

        if (linkLogin) linkLogin.style.display = "none";
        if (btnLogout) btnLogout.style.display = "inline-block";

        if (user.rol === "cliente") {
            if (linkReparacion) {
                linkReparacion.style.display = "inline-block";
                linkReparacion.href = "/concesionario/reparacion.html";
            }
            if (linkPanel) {
                linkPanel.style.display = "inline-block";
                linkPanel.href = "/concesionario/cliente.html";
            }
        } else if (user.rol !== "cliente") {
            if (linkPanel) {
                linkPanel.style.display = "inline-block";
                linkPanel.href = `/concesionario/${user.rol}.html`;
            }
        }

        if (btnLogout) {
            btnLogout.onclick = logout;
        }
    }

	document.addEventListener('DOMContentLoaded', () => {
	    cargarVehiculosColeccion(); // si ya lo tienes
	    activarFormularioPublicar(); // 🔴 AÑADE ESTA LÍNEA
	});
	
    // Inicializar catálogo en index
    if (document.getElementById("vehiculosGrid")) {
        const vehiculos = getVehiculos();
        renderVehiculos(vehiculos);
        renderOfertas(vehiculos);

        const range = document.getElementById("filtroPrecio");
        if (range) {
            range.addEventListener("input", (e) => {
                const precioValor = document.getElementById("precioValor");
                if (precioValor) {
                    precioValor.textContent = "€" + parseInt(e.target.value).toLocaleString();
                }
            });
        }
    }
    
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
});

// ============ UTILIDADES HTTP ============
const apiFetch = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // Importante para sesiones
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
        
        return await response.json();
    } catch (error) {
        console.error('Error API:', error);
        throw error;
    }
};