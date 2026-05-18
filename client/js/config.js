const API_URL = 'http://localhost:5000/api';

const config = {
  apiUrl: API_URL,
  endpoints: {
    auth: {
      register: `${API_URL}/auth/register`,
      login: `${API_URL}/auth/login`,
      me: `${API_URL}/auth/me`,
      forgotPassword: `${API_URL}/auth/forgot-password`,
      resetPassword: `${API_URL}/auth/reset-password`,
      changePassword: `${API_URL}/auth/change-password`
    },
    clientes: {
      list: `${API_URL}/clientes`,
      create: `${API_URL}/clientes`,
      get: (id) => `${API_URL}/clientes/${id}`,
      update: (id) => `${API_URL}/clientes/${id}`,
      delete: (id) => `${API_URL}/clientes/${id}`,
      buscar: (cedula) => `${API_URL}/clientes/buscar/${cedula}`,
      descargarRut: (id) => `${API_URL}/clientes/${id}/rut`
    },
    productos: {
      list: `${API_URL}/productos`,
      stockBajo: `${API_URL}/productos/stock-bajo`,
      create: `${API_URL}/productos`,
      get: (id) => `${API_URL}/productos/${id}`,
      update: (id) => `${API_URL}/productos/${id}`,
      delete: (id) => `${API_URL}/productos/${id}`,
      buscar: (codigo) => `${API_URL}/productos/buscar/${codigo}`,
      ajustarStock: (id) => `${API_URL}/productos/${id}/stock`
    },
    ventas: {
      list: `${API_URL}/ventas`,
      hoy: `${API_URL}/ventas/hoy/resumen`,
      create: `${API_URL}/ventas`,
      get: (id) => `${API_URL}/ventas/${id}`,
      descargarFactura: (id) => `${API_URL}/ventas/${id}/factura`
    },
    caja: {
      saldo: `${API_URL}/caja/saldo`,
      historico: `${API_URL}/caja/historico`,
      reporte: `${API_URL}/caja/reporte`,
      estadisticas: `${API_URL}/caja/estadisticas`
    }
  }
};