const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({ 
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendVerificationEmail = async (email, nombre, token) => {
  const verificationUrl = `http://localhost:3000/verify?token=${token}`;
  
  await transporter.sendMail({
    from: '"AnimeFav" <noreply@animefav.com>',
    to: email,
    subject: 'Verifica tu cuenta en AnimeFav',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #ffffff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #f43f5e; margin-bottom: 8px;">AnimeFav</h1>
        <p style="color: #9ca3af; margin-bottom: 32px;">Tu plataforma de anime</p>
        <h2 style="color: #ffffff;">Hola ${nombre} 👋</h2>
        <p style="color: #d1d5db;">Gracias por registrarte. Haz clic para verificar tu cuenta:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background: #f43f5e; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 24px 0;">
          Verificar mi cuenta
        </a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
          El enlace expira en 24 horas.
        </p>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail };