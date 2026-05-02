const fs = require('fs');
const code = `const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const sendVerificationEmail = async (email, nombre, token) => {
  const url = 'http://localhost:3000/verify?token=' + token;
  await resend.emails.send({
    from: 'AnimeFav <onboarding@resend.dev>',
    to: email,
    subject: 'Verifica tu cuenta en AnimeFav',
    html: '<p>Hola ' + nombre + ', haz clic aqui para verificar tu cuenta: <a href="' + url + '">Verificar</a></p>'
  });
};
module.exports = { sendVerificationEmail };`;
fs.writeFileSync('/app/src/services/emailService.js', code);
console.log('Done');
console.log(require('/app/src/services/emailService'));