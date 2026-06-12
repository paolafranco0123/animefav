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
      return res.status(400).json({ error: 'El email ya esta registrado' });
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
      return res.status(400).json({ error: 'Token invalido o ya verificado' });
    }
    res.json({ message: 'Email verificado. Ya puedes iniciar sesion.' });
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
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    if (!user.email_verificado) {
      return res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesion' });
    }
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        avatar: user.avatar || null,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesion' });
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

const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ error: 'URL de avatar requerida' });
    await User.updateAvatar(userId, avatar);
    res.json({ message: 'Avatar actualizado', avatar });
  } catch (error) {
    console.error('Error actualizando avatar:', error);
    res.status(500).json({ error: 'Error al actualizar avatar' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    const avatarUrl = req.file.path;
    await User.updateAvatar(req.user.id, avatarUrl);
    const updatedUser = await User.findById(req.user.id);
    res.json({ message: 'Avatar subido correctamente', avatar: avatarUrl, user: updatedUser });
  } catch (error) {
    console.error('Error en uploadAvatar:', error);
    res.status(500).json({ error: 'Error al subir el avatar' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre } = req.body;
    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }
    const currentUser = await User.findById(userId);
    await User.update(userId, {
      nombre: nombre.trim(),
      email: currentUser.email,
      fecha_nacimiento: currentUser.fecha_nacimiento
    });
    const updatedUser = await User.findById(userId);
    res.json({ message: 'Perfil actualizado', user: updatedUser });
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};
module.exports = { register, login, getProfile, verifyEmail, updateAvatar, uploadAvatar, updateProfile };