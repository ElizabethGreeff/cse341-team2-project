import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/ticket-classes', () => {
  test('returns all ticket classes with status 200', async () => {
    const response = await request(app).get('/api/ticket-classes');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(3);
    expect(response.body.map((item) => item.class)).toEqual([
      'standard',
      'premium',
      'first'
    ]);
  });

  test('returns only standard class for monday', async () => {
    const response = await request(app).get('/api/ticket-classes?day=monday');

    expect(response.status).toBe(200);
    expect(response.body.map((item) => item.class)).toEqual(['standard']);
  });

  test('returns standard and premium classes for wednesday', async () => {
    const response = await request(app).get('/api/ticket-classes?day=wednesday');

    expect(response.status).toBe(200);
    expect(response.body.map((item) => item.class)).toEqual(['standard', 'premium']);
  });

  test('handles case-insensitive day query parameter for friday', async () => {
    const response = await request(app).get('/api/ticket-classes?day=Friday');

    expect(response.status).toBe(200);
    expect(response.body.map((item) => item.class)).toEqual([
      'standard',
      'premium',
      'first'
    ]);
  });

  test('returns 400 when day query parameter is invalid', async () => {
    const response = await request(app).get('/api/ticket-classes?day=funday');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('returns 400 when day query parameter is empty', async () => {
    const response = await request(app).get('/api/ticket-classes?day=');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('GET /trips/booking/:scheduleId', () => {
  test('renders booking page using ticket classes from Mongoose model', async () => {
    const response = await request(app).get('/trips/booking/1');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Standard Class');
    expect(response.text).toContain('Premium Class');
    expect(response.text).toContain('First Class');
    expect(response.text).toContain('/api/ticket-classes');
  });
});
