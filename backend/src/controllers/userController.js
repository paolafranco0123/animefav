const User = require('../models/User');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    const { nombre, email, contraseña, fecha_nacimiento } = req.body;
    
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    const userId = await User.create({ nombre, email, contraseña, fecha_nacimiento });
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      userId 
    });
    
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};




// Login de usuario
const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await User.comparePassword(contraseña, user.contraseña);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token incluyendo el role
    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        role: user.role // <-- importante para controlar rutas por rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta con usuario y token
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        role: user.role // <-- devuelve el role para pruebas
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = {
  login,
  // ...otros controllers como register, getProfile
};


// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};


module.exports = {
  register,
  login,
  getProfile,
  getAllUsers
};