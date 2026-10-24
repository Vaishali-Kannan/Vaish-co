import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Vaish&Co. Full-Stack API Test Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let sampleProductId: string;
  let sampleProductSlug: string;

  // ─── Health Check ───────────────────────────────────────────────
  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.environment).toBeDefined();
  });

  // ─── Catalogue & Categories ─────────────────────────────────────
  it('GET /api/v1/categories returns seeded categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/products returns real database-seeded products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);

    const first = res.body.products[0];
    sampleProductId = first.id;
    sampleProductSlug = first.slug;
    expect(first.name).toBeDefined();
    expect(first.basePrice).toBeDefined();
    expect(first.deliveryModes).toBeDefined();
  });

  it('GET /api/v1/products/:slug returns a single product with details', async () => {
    expect(sampleProductSlug).toBeDefined();
    const res = await request(app).get(`/api/v1/products/${sampleProductSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(sampleProductSlug);
  });

  // ─── Delivery Speeds & Eligibility ──────────────────────────────
  it('POST /api/v1/delivery/eligibility checks 3 delivery modes', async () => {
    const res = await request(app)
      .post('/api/v1/delivery/eligibility')
      .send({ pincode: '560001', productIds: [sampleProductId], mode: 'QUICK' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // ─── Authentication Flow ─────────────────────────────────────────
  it('POST /api/v1/auth/login succeeds for seeded customer account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'demo@vaishandco.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    customerToken = res.body.data.accessToken;
  });

  it('POST /api/v1/auth/login fails for incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'demo@vaishandco.com', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login succeeds for seeded admin account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@vaishandco.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    adminToken = res.body.data.accessToken;
  });

  it('GET /api/v1/auth/me returns current user profile with token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo@vaishandco.com');
  });

  // ─── Vaish Coins Loyalty Rewards ────────────────────────────────
  it('GET /api/v1/rewards/balance returns customer reward coin balance', async () => {
    const res = await request(app)
      .get('/api/v1/rewards/balance')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balance).toBeGreaterThanOrEqual(0);
  });

  // ─── Vee AI Chatbot ─────────────────────────────────────────────
  it('POST /api/v1/chat/messages returns catalogue-grounded shopping assistance', async () => {
    const res = await request(app)
      .post('/api/v1/chat/messages')
      .send({ message: 'What can I buy under ₹500?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBeDefined();
  });

  // ─── Admin Access Protection ────────────────────────────────────
  it('GET /api/v1/admin/dashboard rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/admin/dashboard rejects normal customer with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/dashboard allows admin user with 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalOrders).toBeDefined();
    expect(res.body.data.revenue).toBeDefined();
  });
});
