import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app.js';

const travinusPayload = {
  error: null,
  data: {
    flightSearchResults: [
      {
        flightSearchResultId: 'offer-book-1',
        departing: {
          duration: '02:25',
          numberOfStops: 0,
          flightNumber: '9484',
          departure: {
            iataCode: 'DEL',
            airportName: 'DEL',
            at: '2026-09-15T23:25:00',
            carrierCode: 'AI',
            carrierName: 'Air India',
            number: '9484',
          },
          arrival: {
            iataCode: 'BOM',
            airportName: 'BOM',
            at: '2026-09-16T01:50:00',
            carrierCode: 'AI',
            carrierName: 'Air India',
            number: '9484',
          },
        },
        priceInfo: { currency: 'INR', grandTotal: 7165, adultTotal: 7165, adultBase: 5650, adultTaxes: 1515 },
        baggageInfo: { checkedInBags: { quantity: 1, weightAllowance: 15 }, carryOnBags: { quantity: 1, weightAllowance: 7 } },
        totalAdults: 1,
        totalChildren: 0,
        totalInfants: 0,
        flightMode: 'OneWay',
        source: 'GDS',
      },
    ],
  },
};

describe('Bookings endpoints', () => {
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

  const register = async (): Promise<string> => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'booker@example.com',
      password: 'password123',
      fullName: 'Booker',
    });
    return res.body.data.token as string;
  };

  const searchOffer = async (): Promise<void> => {
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
  };

const guestContact = {
  fullName: 'A Traveler',
  email: 'guest@example.com',
  phone: '9876543210',
  country: 'India',
  countryCode: '+91',
  city: 'Delhi',
  state: 'Delhi',
  address: '12 Connaught Place',
  zip: '110001',
};

const guestCard = {
  brand: 'VISA' as const,
  holderName: 'A Traveler',
  number: '4111111111111111',
  expDate: '12/29',
  cvv: '123',
};

const guestPassenger = {
  fullName: 'A Traveler',
  dateOfBirth: '1990-01-01',
  gender: 'MALE' as const,
  passengerType: 'ADULT' as const,
};

  it('creates a guest booking without a bearer token', async () => {
    await searchOffer();
    const res = await request(app).post('/api/v1/bookings').send({
      offerId: 'offer-book-1',
      passengers: [guestPassenger],
      contact: guestContact,
      card: guestCard,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.booking.isGuest).toBe(true);
    expect(res.body.data.booking.pnr).toHaveLength(6);
    expect(res.body.data.booking.contact.email).toBe(guestContact.email);
    expect(res.body.data.booking.payment.last4).toBe('1111');
  });

  it('rejects a booking without card details', async () => {
    await searchOffer();
    const res = await request(app).post('/api/v1/bookings').send({
      offerId: 'offer-book-1',
      passengers: [guestPassenger],
      contact: guestContact,
    });
    expect(res.status).toBe(422);
  });

  it('creates a booking from a cached Travinus offer', async () => {
    const token = await register();
    await searchOffer();

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        offerId: 'offer-book-1',
        passengers: [guestPassenger],
        contact: guestContact,
        card: guestCard,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.booking.status).toBe('PENDING');
    expect(res.body.data.booking.offerId).toBe('offer-book-1');
    expect(res.body.data.booking.isGuest).toBe(false);
    expect(res.body.data.booking.passengers).toHaveLength(1);
    expect(res.body.data.booking.payment).toEqual({
      method: 'CARD',
      brand: 'VISA',
      last4: '1111',
      holderName: 'A Traveler',
      expMonth: '12',
      expYear: '29',
    });
    expect(JSON.stringify(res.body)).not.toContain('4111111111111111');
    expect(JSON.stringify(res.body)).not.toContain('123');
  });

  it('lists own bookings and rejects unauthenticated list', async () => {
    const denied = await request(app).get('/api/v1/bookings');
    expect(denied.status).toBe(401);

    const token = await register();
    await searchOffer();
    await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        offerId: 'offer-book-1',
        passengers: [guestPassenger],
        contact: guestContact,
        card: guestCard,
      });

    const res = await request(app).get('/api/v1/bookings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
