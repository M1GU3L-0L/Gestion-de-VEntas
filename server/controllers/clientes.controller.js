const Cliente = require('../models/Cliente');
const path = require('path');
const fs = require('fs');
const { asyncHandler, successResponse, errorResponse } = require('../utils/errorHandler');

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private
exports.getClientes = asyncHandler(async (req, res) => {
  const clientes = await Cliente.find({ activo: true })
    .populate('creadoPor', 'nombre email')
    .sort({ createdAt: -1 });

  successResponse(res, { clientes, total: clientes.length }, 'Clientes obtenidos exitosamente');
});

// @desc    Obtener un cliente por ID
// @route   GET /api/clientes/:id
// @access  Private
exports.getCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id)
    .populate('creadoPor', 'nombre email');

  if (!cliente) {
    return errorResponse(res, 'Cliente no encontrado', 404);
  }

  successResponse(res, { cliente }, 'Cliente obtenido exitosamente');
});

// @desc    Buscar cliente por cédula
// @route   GET /api/clientes/buscar/:cedula
// @access  Private
exports.buscarPorCedula = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findOne({ 
    cedula: req.params.cedula,
    activo: true 
  }).populate('creadoPor', 'nombre email');

  if (!cliente) {
    return errorResponse(res, 'Cliente no encontrado', 404);
  }

  successResponse(res, { cliente }, 'Cliente encontrado');
});

// @desc    Crear cliente
// @route   POST /api/clientes
// @access  Private
exports.createCliente = asyncHandler(async (req, res) => {
  const { nombre, cedula, email, telefono, direccion, ciudad } = req.body;

  // Verificar si ya existe un cliente con esa cédula
  const clienteExiste = await Cliente.findOne({ cedula });
  if (clienteExiste) {
    return errorResponse(res, 'Ya existe un cliente con esa cédula', 400);
  }

  // Datos del cliente
  const clienteData = {
    nombre,
    cedula,
    email,
    telefono,
    direccion,
    ciudad,
    creadoPor: req.user.id
  };

  // Si se subió un archivo
  if (req.file) {
    clienteData.rutFile = {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
  }

  const cliente = await Cliente.create(clienteData);

  successResponse(res, { cliente }, 'Cliente creado exitosamente', 201);
});

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
exports.updateCliente = asyncHandler(async (req, res) => {
  let cliente = await Cliente.findById(req.params.id);

  if (!cliente) {
    return errorResponse(res, 'Cliente no encontrado', 404);
  }

  const { nombre, cedula, email, telefono, direccion, ciudad } = req.body;

  // Si se está cambiando la cédula, verificar que no exista otra
  if (cedula && cedula !== cliente.cedula) {
    const cedulaExiste = await Cliente.findOne({ cedula });
    if (cedulaExiste) {
      return errorResponse(res, 'Ya existe un cliente con esa cédula', 400);
    }
  }

  // Actualizar datos
  cliente.nombre = nombre || cliente.nombre;
  cliente.cedula = cedula || cliente.cedula;
  cliente.email = email || cliente.email;
  cliente.telefono = telefono || cliente.telefono;
  cliente.direccion = direccion || cliente.direccion;
  cliente.ciudad = ciudad || cliente.ciudad;

  // Si se subió un nuevo archivo, eliminar el anterior
  if (req.file) {
    // Eliminar archivo anterior si existe
    if (cliente.rutFile && cliente.rutFile.path) {
      try {
        if (fs.existsSync(cliente.rutFile.path)) {
          fs.unlinkSync(cliente.rutFile.path);
        }
      } catch (error) {
        console.error('Error al eliminar archivo anterior:', error);
      }
    }

    // Guardar nuevo archivo
    cliente.rutFile = {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
  }

  await cliente.save();

  successResponse(res, { cliente }, 'Cliente actualizado exitosamente');
});

// @desc    Eliminar cliente (soft delete)
// @route   DELETE /api/clientes/:id
// @access  Private
exports.deleteCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);

  if (!cliente) {
    return errorResponse(res, 'Cliente no encontrado', 404);
  }

  // Soft delete
  cliente.activo = false;
  await cliente.save();

  successResponse(res, null, 'Cliente eliminado exitosamente');
});

// @desc    Descargar RUT del cliente
// @route   GET /api/clientes/:id/rut
// @access  Private
exports.descargarRut = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);

  if (!cliente) {
    return errorResponse(res, 'Cliente no encontrado', 404);
  }

  if (!cliente.rutFile || !cliente.rutFile.path) {
    return errorResponse(res, 'El cliente no tiene RUT cargado', 404);
  }

  const filePath = path.resolve(cliente.rutFile.path);

  if (!fs.existsSync(filePath)) {
    return errorResponse(res, 'Archivo no encontrado', 404);
  }

  res.download(filePath, `RUT-${cliente.cedula}.pdf`);
});