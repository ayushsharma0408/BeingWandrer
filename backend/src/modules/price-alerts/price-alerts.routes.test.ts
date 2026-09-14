import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@best-in-flights-booking/shared-core';
import { createApp } from '../../app.js';
import { PriceAlertModel } from './price-alerts.model.js';

const payload = {
  email: 'alerts@example.com',
  origin: 'DEL',
  destination: 'BOM',
  departureDate: '2026-09-20',
  flightMode: 'OneWay',
  currency: 'INR',
  currentPrice: 7165,
};

describe('Price alert endpoints', () => {
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

  it('creates a price alert without login', async () => {
    const res = await request(app).post('/api/v1/price-alerts').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.alert.origin).toBe('DEL');
    expect(res.body.data.alert.currentPrice).toBe(7165);
    expect(res.body.data.alert.email).toBeUndefined();
  });

  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/v1/price-alerts').send({ ...payload, email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('updates the same route instead of duplicating', async () => {
    await request(app).post('/api/v1/price-alerts').send(payload);
    const res = await request(app).post('/api/v1/price-alerts').send({ ...payload, currentPrice: 6800 });
    expect(res.status).toBe(201);
    expect(res.body.data.alert.currentPrice).toBe(6800);
    const count = await PriceAlertModel.countDocuments();
    expect(count).toBe(1);
  });
});
