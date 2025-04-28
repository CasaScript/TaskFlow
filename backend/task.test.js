const request = require('supertest');
const app = require('./server');
const Task = require('../models/Task');

describe('GET /api/tasks', () => {
  it('Devrait retourner 200 et un tableau de tâches', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.taches)).toBe(true);
  });
});