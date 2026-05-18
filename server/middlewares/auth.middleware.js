const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { errorResponse } = require('../utils/errorHandler');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'No autorizado para acceder a esta ruta', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    if (!req.user.activo) {
      return errorResponse(res, 'Usuario inactivo', 401);
    }

    next();
  } catch (error) {
    return errorResponse(res, 'Token inválido o expirado', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return errorResponse(
        res,
        `El rol ${req.user.rol} no está autorizado para acceder a esta ruta`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };