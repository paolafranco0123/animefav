const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');



const register = async (req, res) => {
  try {
    const { nombre, email, password, fecha_nacimiento } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const { userId, token } = await User.create({ nombre, email, password, fecha_nacimiento });
    await sendVerificationEmail(email, nombre, token);
    res.status(201).json({ message: 'Cuenta creada. Revisa tu email para verificarla.' });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const affected = await User.verifyEmail(token);
    if (!affected) {
      return res.status(400).json({ error: 'Token inválido o ya verificado' });
    }
    res.json({ message: 'Email verificado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    res.status(500).json({ error: 'Error al verificar email' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    if (!user.email_verificado) {
      return res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesión' });
    }
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ message: 'Login exitoso', token, user: { id: user.id_usuario, nombre: user.nombre, email: user.email } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

module.exports = { register, login, getProfile, verifyEmail };