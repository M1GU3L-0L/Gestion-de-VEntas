// Obtener saldo de caja
async function getSaldoCaja() {
  return await apiRequest(config.endpoints.caja.saldo, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Histórico
async function getHistoricoCaja(filtros = {}) {
  validarFechas(filtros);

  let url = config.endpoints.caja.historico;

  const params = new URLSearchParams();
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
  if (filtros.metodoPago) params.append('metodoPago', filtros.metodoPago);

  if (params.toString()) {
    url += '?' + params.toString();
  }

  return await apiRequest(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Estadísticas
async function getEstadisticas() {
  return await apiRequest(config.endpoints.caja.estadisticas, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

// Descargar reporte
async function descargarReporte(filtros = {}) {
  validarFechas(filtros);

  const token = getToken();
  let url = config.endpoints.caja.reporte;

  const params = new URLSearchParams();
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

  if (params.toString()) {
    url += '?' + params.toString();
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al descargar el reporte');
  }

  const blob = await response.blob();
  const urlBlob = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlBlob;
  a.download = `Reporte-Caja-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(urlBlob);
  document.body.removeChild(a);
}

// Validación fechas
function validarFechas(filtros) {
  if (filtros.fechaInicio && filtros.fechaFin) {
    if (new Date(filtros.fechaInicio) > new Date(filtros.fechaFin)) {
      throw new Error("La fecha inicio no puede ser mayor a la fecha fin");
    }
  }
}