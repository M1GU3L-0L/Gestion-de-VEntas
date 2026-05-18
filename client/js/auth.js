// Guardar token en localStorage
function saveToken(token) {
  localStorage.setItem('token', token);
}

// Obtener token de localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Eliminar token
function removeToken() {
  localStorage.removeItem('token');
}

// Guardar usuario en localStorage
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Obtener usuario de localStorage
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
  return !!getToken();
}

// Cerrar sesión
function logout() {
  removeToken();
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Verificar autenticación en páginas protegidas
function checkAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
  }
}

// Obtener headers con token
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}