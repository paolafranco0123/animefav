const request = require('supertest');
const express = require('express');
const userRoutes = require('../src/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('Auth endpoints', () => {

  // Test unitario 1: registro sin datos obligatorios
  test('POST /register debe fallar si faltan datos', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'test@test.com' }); // falta nombre y password
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });



  // Test unitario 2: login sin datos
  test('POST /login debe fallar si faltan datos', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({}); // sin email ni password
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

// Test unitario 3: login con email inválido (sin BD)
test('POST /login debe fallar con email invalido', async () => {
  const res = await request(app)
    .post('/api/users/login')
    .send({ email: 'emailinvalido', password: 'wrongpassword' });
  
 expect([400, 401, 500]).toContain(res.statusCode);
  expect(res.body.error).toBeDefined();
});

// Test Unitario 4: login debe fallar con credenciales invalidas
test('POST /login debe fallar con credenciales invalidas', async () => {
  const res = await request(app)
    .post('/api/users/login')
    .send({ email: 'noexiste@test.com', password: 'wrongpassword' });
  
  expect([401, 500]).toContain(res.statusCode);
  expect(res.body.error).toBeDefined();
});

  // Test funcional: perfil sin token
  test('GET /profile debe fallar sin token', async () => {
    const res = await request(app)
      .get('/api/users/profile');
    
    expect(res.statusCode).toBe(401);
  });

});