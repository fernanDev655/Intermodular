// ==========================================
// app.js - Conexión con Spring Boot API
// ==========================================

const API_URL = 'http://localhost:8080/api/vehiculos';

// Obtener todos los vehículos (GET)
function getVehiculos() {
    return fetch(API_URL)
        .then(res => res.json())
        .catch(err => {
            console.error('Error cargando vehículos:', err);
            return [];
        });
}

// Buscar vehículo por ID (GET)
function getVehiculoPorId(id) {
    return fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .catch(err => {
            console.error('Error:', err);
            return null;
        });
}

// Filtrar vehículos con query params (GET)
function buscarVehiculos(filtros) {
    const params = new URLSearchParams();
    
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.marca) params.append('marca', filtros.marca);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.anio) params.append('anio', filtros.anio);
    if (filtros.combustible) params.append('combustible', filtros.combustible);
    if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
    if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
    
    const url = `${API_URL}/buscar?${params.toString()}`;
    
    return fetch(url)
        .then(res => res.json())
        .catch(err => {
            console.error('Error en búsqueda:', err);
            return [];
        });
}

// Crear vehículo (POST) - para admin
function crearVehiculo(vehiculo) {
    return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculo)
    })
    .then(res => res.json())
    .catch(err => {
        console.error('Error creando vehículo:', err);
        return null;
    });
}

// Actualizar vehículo (PUT)
function actualizarVehiculo(id, vehiculo) {
    return fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculo)
    })
    .then(res => res.json())
    .catch(err => {
        console.error('Error actualizando:', err);
        return null;
    });
}

// Eliminar vehículo (DELETE)
function eliminarVehiculo(id) {
    return fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.ok)
    .catch(err => {
        console.error('Error eliminando:', err);
        return false;
    });
}

// ==========================================
// PARA TU coleccion.html - Adaptado
// ==========================================

// Reemplaza tu filtrarColeccion() actual por esto:
async function filtrarColeccion() {
    const filtros = {
        nombre: document.getElementById("filtroNombre")?.value?.toLowerCase().trim() || "",
        marca: document.getElementById("filtroMarca")?.value || "",
        tipo: document.getElementById("filtroTipo")?.value || "",
        anio: document.getElementById("filtroAnio")?.value || "",
        combustible: document.getElementById("filtroCombustible")?.value || "",
        precioMin: document.getElementById("precioMin")?.value || "",
        precioMax: document.getElementById("precioMax")?.value || ""
    };

    // Ordenar lo manejás en el frontend después
    const ordenar = document.getElementById("ordenar")?.value || "relevancia";

    // Llamada a la API
    let vehiculos = await buscarVehiculos(filtros);

    // Ordenar en frontend
    switch (ordenar) {
        case "precio-asc":
            vehiculos.sort((a, b) => a.precio - b.precio);
            break;
        case "precio-desc":
            vehiculos.sort((a, b) => b.precio - a.precio);
            break;
        case "anio-desc":
            vehiculos.sort((a, b) => b.anio - a.anio);
            break;
        case "anio-asc":
            vehiculos.sort((a, b) => a.anio - b.anio);
            break;
    }

    // Actualizar contador
    const countEl = document.getElementById("resultadosCount");
    if (vehiculos.length === 0) {
        countEl.textContent = "No se encontraron vehículos";
    } else {
        countEl.textContent = `Mostrando ${vehiculos.length} vehículo${vehiculos.length !== 1 ? "s" : ""}`;
    }

    mostrarFiltrosColeccion(filtros);
    renderGridColeccion(vehiculos);
}

// Ver detalle con redirección (reemplaza tu función actual)
function verDetalleColeccion(id) {
    window.location.href = `detalle.html?id=${id}`;
}

// ==========================================
// ESTRUCTURA DEL VEHÍCULO (lo que espera Spring Boot)
// ==========================================
/*
{
    "id": 1,
    "marca": "Mercedes-Benz",
    "modelo": "Clase S",
    "descripcion": "Sedán de lujo...",
    "tipo": "sedan",
    "anio": 2024,
    "combustible": "hibrido",
    "precio": 125000,
    "km": 15000,
    "enOferta": true,
    "descuento": 10,
    "imagen": "url-de-la-foto.jpg"
}
*/