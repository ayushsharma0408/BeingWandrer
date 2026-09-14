import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@best-in-flights-booking/shared-core';
import { createApp } from '../../app.js';
import { COOKIE } from '../../shared/constants/index.js';

const credentials = {
  email: 'traveler@example.com',
  password: 'password123',
  fullName: 'Alex Traveler',
};

const readCookie = (res: request.Response): string => {
  const raw = res.headers['set-cookie'];
  if (!raw) {
    throw new Error('Expected Set-Cookie header');
  }
  const list = Array.isArray(raw) ? raw : [raw];
  const match = list.find((item) => item.startsWith(`${COOKIE.REFRESH_TOKEN}=`));
  if (!match) {
    throw new Error('Expected refreshToken cookie');
  }
  return match;
};

describe('Auth endpoints', () => {
  let mongo: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('registers a USER and returns token plus refresh cookie', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(res.body.data.user.role).toBe('USER');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(typeof res.body.data.token).toBe('string');
    expect(readCookie(res)).toContain('HttpOnly');
  });

  it('rejects register with a short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'bad@example.com', password: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(typeof res.body.data.token).toBe('string');
  });

  it('rejects login with invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it('refreshes the access token using the httpOnly cookie', async () => {
    const registered = await request(app).post('/api/v1/auth/register').send(credentials);
    const cookie = readCookie(registered);

    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Token refreshed');
    expect(typeof res.body.data.token).toBe('string');
  });

  it('returns the current profile for a valid bearer token', async () => {
    const registered = await request(app).post('/api/v1/auth/register').send(credentials);
    const token = registered.body.data.token as string;

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(credentials.email);
  });

  it('rejects /me without a bearer token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('logs out and clears the refresh cookie', async () => {
    const registered = await request(app).post('/api/v1/auth/register').send(credentials);
    const token = registered.body.data.token as string;
    const cookie = readCookie(registered);

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');

    const refreshAfter = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(refreshAfter.status).toBe(401);
  });

  it('rejects /logout without a bearer token', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });
});
