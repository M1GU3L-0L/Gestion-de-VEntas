const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const emailService = require('../services/email.service');
const { asyncHandler, successResponse, errorResponse } = require('../utils/errorHandler');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse(res, 'El email ya está registrado', 400);
  }

  // Crear usuario
  const user = await User.create({
    nombre,
    email,
    password,
    rol: rol || 'vendedor'
  });

  // Enviar email de bienvenida (opcional, no bloquear si falla)
  try {
    await emailService.sendWelcomeEmail(user.email, user.nombre);
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error);
  }

  // Generar token
  const token = generateToken(user._id);

  successResponse(
    res,
    {
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    },
    'Usuario registrado exitosamente',
    201
  );
});

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validar email y password
  if (!email || !password) {
    return errorResponse(res, 'Por favor proporciona email y contraseña', 400);
  }

  // Buscar usuario
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return errorResponse(res, 'Credenciales inválidas', 401);
  }

  // Verificar contraseña
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return errorResponse(res, 'Credenciales inválidas', 401);
  }

  // Verificar si el usuario está activo
  if (!user.activo) {
    return errorResponse(res, 'Usuario inactivo', 401);
  }

  // Generar token
  const token = generateToken(user._id);

  successResponse(res, {
    token,
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  }, 'Login exitoso');
});

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  successResponse(res, {
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  });
});

// @desc    Olvidé mi contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return errorResponse(res, 'No existe un usuario con ese email', 404);
  }

  // Generar token de reseteo
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await emailService.sendResetPasswordEmail(user.email, resetToken);
    
    successResponse(res, null, 'Email de recuperación enviado');
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return errorResponse(res, 'Error al enviar el email de recuperación', 500);
  }
});

// @desc    Restablecer contraseña
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash del token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return errorResponse(res, 'Token inválido o expirado', 400);
  }

  // Establecer nueva contraseña
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generar nuevo token JWT
  const jwtToken = generateToken(user._id);

  successResponse(res, {
    token: jwtToken,
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  }, 'Contraseña restablecida exitosamente');
});

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Verificar contraseña actual
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return errorResponse(res, 'Contraseña actual incorrecta', 401);
  }

  // Establecer nueva contraseña
  user.password = newPassword;
  await user.save();

  successResponse(res, null, 'Contraseña actualizada exitosamente');
});