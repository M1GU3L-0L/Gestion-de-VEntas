// Obtener todas las ventas
async function getVentas() {
  return await apiRequest(config.endpoints.ventas.list, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Ventas del día
async function getVentasHoy() {
  return await apiRequest(config.endpoints.ventas.hoy, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Crear venta
async function createVenta(ventaData) {
  validarVenta(ventaData);

  return await apiRequest(config.endpoints.ventas.create, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ventaData)
  });
}

// Obtener venta por ID
async function getVenta(id) {
  return await apiRequest(config.endpoints.ventas.get(id), {
    method: 'GET',
    headers: getAuthHeaders()
  });
}