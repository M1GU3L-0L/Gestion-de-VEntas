// ===============================
// VALIDACIONES GENERALES FRONTEND
// ===============================

function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function isNumber(value) {
  return !isNaN(value) && value !== null && value !== "";
}

function isPositiveNumber(value) {
  return isNumber(value) && Number(value) > 0;
}

function isNonNegativeNumber(value) {
  return isNumber(value) && Number(value) >= 0;
}

function showError(message) {
  throw new Error(message);
}

// ===============================
// VALIDACIONES PRODUCTOS
// ===============================

function validarProducto(data) {
  if (isEmpty(data.codigo)) showError("El código es obligatorio");
  if (isEmpty(data.nombre)) showError("El nombre es obligatorio");
  if (isEmpty(data.categoria)) showError("La categoría es obligatoria");

  if (!isNonNegativeNumber(data.precio))
    showError("El precio es inválido");

  if (!isNonNegativeNumber(data.costo))
    showError("El costo es inválido");

  if (Number(data.precio) <= Number(data.costo))
    showError("El precio debe ser mayor al costo");

  if (!isNonNegativeNumber(data.stock))
    showError("El stock inicial es inválido");

  if (!isNonNegativeNumber(data.stockMinimo))
    showError("El stock mínimo es inválido");

  if (Number(data.stockMinimo) > Number(data.stock))
    showError("El stock mínimo no puede ser mayor al stock inicial");
}

// ===============================
// VALIDACIÓN STOCK
// ===============================

function validarAjusteStock(cantidad, tipo, stockActual) {
  if (!isPositiveNumber(cantidad))
    showError("Cantidad inválida");

  if (!["agregar", "quitar"].includes(tipo))
    showError("Tipo de ajuste inválido");

  if (tipo === "quitar" && Number(cantidad) > Number(stockActual))
    showError("No puedes quitar más stock del disponible");
}

// ===============================
// VALIDACIONES CLIENTES
// ===============================

function validarCliente(data) {
  if (isEmpty(data.nombre)) showError("El nombre es obligatorio");
  if (isEmpty(data.cedula)) showError("La cédula es obligatoria");
  if (isEmpty(data.telefono)) showError("El teléfono es obligatorio");

  if (data.cedula && data.cedula.length < 6)
    showError("Cédula inválida");
}

// ===============================
// VALIDACIONES VENTAS
// ===============================

function validarVenta(data) {

  // ahora valida lo correcto
  if (!Array.isArray(data.items) || data.items.length === 0) {
    showError("Debe haber al menos un producto en la venta");
    return false;
  }

  if (!isPositiveNumber(data.total)) {
    showError("Total inválido");
    return false;
  }

  return true;
}