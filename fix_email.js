const fs = require('fs');
const user = '657139b4d81396';
const pass = '81666cd472c9f8';

const code = `const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: { user: '${user}', pass: '${pass}' }
});

const sendVerificationEmail = async (email, nombre, token) => {
  const url = 'http://localhost:3000/verify?token=' + token;
  await transporter.sendMail({
    from: 'AnimeFav noreply@animefav.com',
    to: email,
    subject: 'Verifica tu cuenta en AnimeFav',
    html: '<div style="font-family:Arial;padding:40px;background:#0a0a0f;color:#fff;border-radius:16px"><h1 style="color:#f43f5e">AnimeFav</h1><h2>Hola ' + nombre + '</h2><p>Haz clic para verificar tu cuenta:</p><a href="' + url + '" style="background:#f43f5e;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;display:inline-block;margin:24px 0">Verificar mi cuenta</a><p style="color:#6b7280;font-size:12px">El enlace expira en 24 horas.</p></div>'
  });
};

module.exports = { sendVerificationEmail };`;

fs.writeFileSync('/app/src/services/emailService.js', code);
console.log('Done');