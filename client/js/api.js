// Función genérica para hacer peticiones a la API
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// Login
async function loginUser(email, password) {
  const data = await apiRequest(config.endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (data.success) {
    saveToken(data.data.token);
    saveUser(data.data.user);
  }
  
  return data;
}

// Registro
async function registerUser(userData) {
  const data = await apiRequest(config.endpoints.auth.register, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  if (data.success) {
    saveToken(data.data.token);
    saveUser(data.data.user);
  }
  
  return data;
}

// Recuperar contraseña
async function forgotPassword(email) {
  return await apiRequest(config.endpoints.auth.forgotPassword, {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

// Restablecer contraseña
async function resetPassword(token, password) {
  return await apiRequest(config.endpoints.auth.resetPassword, {
    method: 'POST',
    body: JSON.stringify({ token, password })
  });
}

// Obtener usuario actual
async function getCurrentUser() {
  return await apiRequest(config.endpoints.auth.me, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}