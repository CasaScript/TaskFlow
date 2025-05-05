const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

let server;

beforeAll(async () => {
  // Démarrage du serveur sur un port aléatoire
  server = app.listen(0); 
});

afterAll(async () => {
  // Nettoyage complet
  await server.close();
  await mongoose.disconnect();
});

describe('POST /api/users/login', () => {
  it('Devrait retourner 401 avec un mot de passe incorrect', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    expect(res.statusCode).toBe(401);
  });
});
