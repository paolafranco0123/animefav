const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
});

client.on('error', (err) => console.warn('⚠️ Redis error:', err.message));
client.on('connect', () => console.log('✅ Redis conectado'));

// Conectar al iniciar — si falla, el resto de la app sigue funcionando
client.connect().catch((err) => {
  console.warn('⚠️ Redis no disponible, continuando sin caché:', err.message);
});

module.exports = client;