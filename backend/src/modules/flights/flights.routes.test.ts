import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ERROR_CODES } from '@best-in-flights-booking/shared-core';
import { createApp } from '../../app.js';

const travinusPayload = {
  error: null,
  data: {
    flightSearchResultsCount: 1,
    flightSearchResults: [
      {
        flightSearchResultId: 'offer-1',
        departing: {
          duration: '02:25',
          numberOfStops: 0,
          flightNumber: '9484',
          departure: {
            iataCode: 'DEL',
            airportName: 'Indira Gandhi International Airport',
            at: '2026-09-15T23:25:00',
            carrierCode: 'AI',
            carrierName: 'Air India',
            number: '9484',
            refundable: false,
          },
          arrival: {
            iataCode: 'BOM',
            airportName: 'Chhatrapati Shivaji International Airport',
            at: '2026-09-16T01:50:00',
            carrierCode: 'AI',
            carrierName: 'Air India',
            number: '9484',
          },
        },
        returning: null,
        priceInfo: {
          currency: 'INR',
          adultTotal: 7165,
          adultBase: 5650,
          adultTaxes: 1515,
          grandTotal: 7165,
        },
        baggageInfo: {
          checkedInBags: { quantity: 1, unit: 'PCS', weightAllowance: 15 },
          carryOnBags: { quantity: 1, unit: 'PCS', weightAllowance: 7 },
        },
        totalAdults: 1,
        totalChildren: 0,
        totalInfants: 0,
        flightMode: 'OneWay',
        source: 'GDS',
      },
    ],
  },
};

describe('Flights endpoints', () => {
  let mongo: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it('searches flights and returns mapped offers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => travinusPayload,
      }),
    );

    const res = await request(app).get(
      '/api/v1/flights/search?origin=DEL&destination=BOM&departureDate=2026-09-15&adults=1&flightMode=OneWay',
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(1);
    expect(res.body.data.offers[0].offerId).toBe('offer-1');
    expect(res.body.data.offers[0].departing.departure.iataCode).toBe('DEL');
    expect(res.body.meta.total).toBe(1);
  });

  it('rejects search when origin equals destination', async () => {
    const res = await request(app).get(
      '/api/v1/flights/search?origin=DEL&destination=DEL&departureDate=2026-09-15&adults=1',
    );

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('returns a cached offer after search', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => travinusPayload,
      }),
    );

    await request(app).get(
      '/api/v1/flights/search?origin=DEL&destination=BOM&departureDate=2026-09-15&adults=1',
    );
    const res = await request(app).get('/api/v1/flights/offers/offer-1');

    expect(res.status).toBe(200);
    expect(res.body.data.offer.offerId).toBe('offer-1');
  });
});
