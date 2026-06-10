const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');


<<<<<<< HEAD

=======
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
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
<<<<<<< HEAD
    const { userId, token } = await User.create({ nombre, email, password, fecha_nacimiento });
    await sendVerificationEmail(email, nombre, token);
    res.status(201).json({ message: 'Cuenta creada. Revisa tu email para verificarla.' });
=======
    const userId = await User.create({ nombre, email, password, fecha_nacimiento });
    res.status(201).json({ message: 'Usuario creado exitosamente', userId });
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

<<<<<<< HEAD
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

=======
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
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
<<<<<<< HEAD
    if (!user.email_verificado) {
      return res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesión' });
    }
=======
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
<<<<<<< HEAD
    res.json({ message: 'Login exitoso', token, user: { id: user.id_usuario, nombre: user.nombre, email: user.email } });
=======
    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id_usuario, nombre: user.nombre, email: user.email }
    });
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

<<<<<<< HEAD

=======
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
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

<<<<<<< HEAD
module.exports = { register, login, getProfile, verifyEmail };
=======
module.exports = { register, login, getProfile };
>>>>>>> f47cac16fd014f5b7b878bca514ed2a672961e32
