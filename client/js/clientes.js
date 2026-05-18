// Obtener todos los clientes
async function getClientes() {
  return await apiRequest(config.endpoints.clientes.list, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Crear cliente
async function createCliente(formData) {
  const data = Object.fromEntries(formData.entries());
  validarCliente(data);

  const token = getToken();

  const response = await fetch(config.endpoints.clientes.create, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const res = await response.json();
  if (!response.ok) throw new Error(res.message);
  return res;
}

// Actualizar cliente
async function updateCliente(id, formData) {
  const data = Object.fromEntries(formData.entries());
  validarCliente(data);

  const token = getToken();

  const response = await fetch(config.endpoints.clientes.update(id), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const res = await response.json();
  if (!response.ok) throw new Error(res.message);
  return res;
}

// Eliminar cliente
async function deleteCliente(id) {
  return await apiRequest(config.endpoints.clientes.delete(id), {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

// Buscar cliente por cédula
async function buscarClientePorCedula(cedula) {
  return await apiRequest(config.endpoints.clientes.buscar(cedula), {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Obtener cliente por ID
async function getCliente(id) {
  return await apiRequest(config.endpoints.clientes.get(id), {
    method: 'GET',
    headers: getAuthHeaders()
  });
}