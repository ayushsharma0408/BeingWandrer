import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { BOOKING_STATUSES, ERROR_CODES, USER_ROLES } from '@best-in-flights-booking/shared-core';
import { createApp } from '../../app.js';
import { seedAdminUser } from '../auth/auth.service.js';

const app = createApp();

const adminLogin = async (): Promise<string> => {
  await seedAdminUser();
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@example.com',
    password: 'test-admin-password',
    portal: 'admin',
  });
  return res.body.data.token as string;
};

describe('Admin portal endpoints', () => {
  let mongo: MongoMemoryServer;

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

  it('rejects consumer credentials on the admin portal', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'traveler@example.com',
      password: 'password123',
      fullName: 'Traveler',
    });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'traveler@example.com',
      password: 'password123',
      portal: 'admin',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('rejects USER access to the dashboard and allows ADMIN', async () => {
    const userRes = await request(app).post('/api/v1/auth/register').send({
      email: 'traveler@example.com',
      password: 'password123',
    });
    const denied = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userRes.body.data.token}`);
    expect(denied.status).toBe(403);

    const token = await adminLogin();
    const ok = await request(app).get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.counts).toHaveProperty('all');
    expect(ok.body.data.counts).toHaveProperty('staff');
  });

  it('creates and lists staff', async () => {
    const token = await adminLogin();
    const created = await request(app)
      .post('/api/v1/admin/staff')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'agent@example.com',
        password: 'password123',
        fullName: 'Agent One',
        role: USER_ROLES.EMPLOYEE,
      });
    expect(created.status).toBe(201);
    expect(created.body.data.staff.role).toBe(USER_ROLES.EMPLOYEE);

    const list = await request(app)
      .get('/api/v1/admin/staff?role=EMPLOYEE')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.items).toHaveLength(1);
  });

  it('creates a customer and records activity', async () => {
    const token = await adminLogin();
    const created = await request(app)
      .post('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'cust@example.com',
        password: 'password123',
        fullName: 'Cust',
      });
    expect(created.status).toBe(201);

    const activity = await request(app).get('/api/v1/admin/activity').set('Authorization', `Bearer ${token}`);
    expect(activity.status).toBe(200);
    expect(activity.body.data.items.length).toBeGreaterThan(0);

    const sessions = await request(app).get('/api/v1/admin/sessions?audience=staff').set('Authorization', `Bearer ${token}`);
    expect(sessions.status).toBe(200);
    expect(sessions.body.data.items.length).toBeGreaterThan(0);
  });

  it('manages offer pages, public inquiries, and assignment', async () => {
    const token = await adminLogin();
    const offer = await request(app)
      .post('/api/v1/admin/offers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Goa sale',
        slug: 'goa-sale',
        publishDate: '2026-09-10',
        status: 'PUBLISH',
      });
    expect(offer.status).toBe(201);

    const published = await request(app).get('/api/v1/offers');
    expect(published.status).toBe(200);
    expect(published.body.data.items).toHaveLength(1);
    expect(published.body.data.items[0].slug).toBe('goa-sale');

    const bySlug = await request(app).get('/api/v1/offers/goa-sale');
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.offer.name).toBe('Goa sale');

    const draft = await request(app)
      .post('/api/v1/admin/offers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Hidden draft',
        slug: 'hidden-draft',
        publishDate: '2026-09-10',
        status: 'DRAFT',
      });
    expect(draft.status).toBe(201);
    const stillOne = await request(app).get('/api/v1/offers');
    expect(stillOne.body.data.items).toHaveLength(1);

    const inquiry = await request(app).post('/api/v1/offer-inquiries').send({
      offerPageId: offer.body.data.offer.id,
      name: 'Lead',
      phone: '9999999999',
      email: 'lead@example.com',
      passengerCount: 2,
      travelDate: '2026-10-01',
    });
    expect(inquiry.status).toBe(201);

    const unassigned = await request(app)
      .get('/api/v1/admin/inquiries?assignment=unassigned')
      .set('Authorization', `Bearer ${token}`);
    expect(unassigned.body.data.items).toHaveLength(1);

    const assigned = await request(app)
      .patch(`/api/v1/admin/inquiries/${inquiry.body.data.inquiry.id}/assign`)
      .set('Authorization', `Bearer ${token}`);
    expect(assigned.status).toBe(200);
    expect(assigned.body.data.inquiry.assignedTo.email).toBe('admin@example.com');
  });

  it('creates a route with markup', async () => {
    const token = await adminLogin();
    const route = await request(app)
      .post('/api/v1/admin/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        referenceName: 'DEL-BOM D2C',
        origin: 'DEL',
        destination: 'BOM',
        airlines: 'ALL',
        status: 'ACTIVE',
      });
    expect(route.status).toBe(201);

    const markup = await request(app)
      .post(`/api/v1/admin/routes/${route.body.data.route.id}/markups`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        inboundClasses: 'Y,B',
        outboundClasses: 'Y',
        markupAmount: 250,
        markupType: 'FIXED',
        onePx: '250',
        startActiveDate: '2026-01-01',
        endActiveDate: '2026-12-31',
      });
    expect(markup.status).toBe(201);

    const rejected = await request(app)
      .post(`/api/v1/admin/routes/${route.body.data.route.id}/markups`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        markupType: 'FIXED',
        markupAmount: 0,
      });
    expect(rejected.status).toBe(422);

    const list = await request(app)
      .get(`/api/v1/admin/routes/${route.body.data.route.id}/markups`)
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.data.items).toHaveLength(1);
  });

  it('moves a booking through the admin lifecycle', async () => {
    const token = await adminLogin();
    const { BookingModel } = await import('../bookings/bookings.model.js');
    const booking = await BookingModel.create({
      offerId: 'offer-admin-1',
      status: BOOKING_STATUSES.PENDING,
      pnr: 'ABC123',
      totalAmount: 9000,
      currency: 'INR',
      isOnline: true,
      offer: {
        offerId: 'offer-admin-1',
        flightMode: 'OneWay',
        currency: 'INR',
        grandTotal: 9000,
        adultTotal: 9000,
        adultBase: 7000,
        adultTaxes: 2000,
        departing: {
          duration: '02:00',
          numberOfStops: 0,
          flightNumber: 'AI101',
          segments: [],
          departure: {
            iataCode: 'DEL',
            airportName: 'DEL',
            at: '2026-10-01T10:00:00',
            carrierCode: 'AI',
            carrierName: 'Air India',
            flightNumber: 'AI101',
          },
          arrival: {
            iataCode: 'BOM',
            airportName: 'BOM',
            at: '2026-10-01T12:00:00',
            carrierCode: 'AI',
            carrierName: 'Air India',
            flightNumber: 'AI101',
          },
        },
        returning: null,
        baggage: { checkedInBags: { quantity: 1, weightAllowance: 15 }, carryOnBags: { quantity: 1, weightAllowance: 7 } },
        adults: 1,
        children: 0,
        infants: 0,
        source: 'GDS',
        refundable: false,
      },
      contact: {
        fullName: 'Guest Traveler',
        email: 'guest@example.com',
        phone: '9000000000',
        country: 'IN',
        countryCode: '+91',
        city: 'Delhi',
        state: 'DL',
        address: '1 Main',
        zip: '110001',
      },
      extras: { refundable: false, addPack: false },
    });

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    const assigned = await request(app)
      .patch(`/api/v1/admin/bookings/${String(booking._id)}/assign`)
      .set('Authorization', `Bearer ${token}`)
      .send({ assignedTo: me.body.data.user.id });
    expect(assigned.status).toBe(200);
    expect(assigned.body.data.booking.status).toBe(BOOKING_STATUSES.ASSIGNED);

    const processing = await request(app)
      .patch(`/api/v1/admin/bookings/${String(booking._id)}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: BOOKING_STATUSES.PROCESSING, comment: 'Calling airline' });
    expect(processing.status).toBe(200);
    expect(processing.body.data.booking.status).toBe(BOOKING_STATUSES.PROCESSING);

    const lifecycle = await request(app)
      .get(`/api/v1/admin/bookings/${String(booking._id)}/lifecycle`)
      .set('Authorization', `Bearer ${token}`);
    expect(lifecycle.body.data.items.length).toBeGreaterThanOrEqual(2);

    const unassigned = await request(app)
      .get('/api/v1/admin/bookings?status=UNASSIGNED')
      .set('Authorization', `Bearer ${token}`);
    expect(unassigned.status).toBe(200);
  });
});
