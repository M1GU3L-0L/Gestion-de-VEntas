// Obtener todos los productos
async function getProductos() {
  return await apiRequest(config.endpoints.productos.list, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Obtener productos con stock bajo
async function getProductosStockBajo() {
  return await apiRequest(config.endpoints.productos.stockBajo, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Crear producto
async function createProducto(productoData) {
  validarProducto(productoData);

  return await apiRequest(config.endpoints.productos.create, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productoData)
  });
}

// Actualizar producto
async function updateProducto(id, productoData) {
  validarProducto(productoData);

  return await apiRequest(config.endpoints.productos.update(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productoData)
  });
}

// Eliminar producto
async function deleteProducto(id) {
  return await apiRequest(config.endpoints.productos.delete(id), {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

// Buscar producto por código
async function buscarProductoPorCodigo(codigo) {
  return await apiRequest(config.endpoints.productos.buscar(codigo), {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Obtener producto por ID
async function getProducto(id) {
  return await apiRequest(config.endpoints.productos.get(id), {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Ajustar stock
async function ajustarStock(id, cantidad, tipo, stockActual) {
  validarAjusteStock(cantidad, tipo, stockActual);

  return await apiRequest(config.endpoints.productos.ajustarStock(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ cantidad, tipo })
  });
}