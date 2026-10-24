import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

import env from './config/env';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

// Routers
import authRouter from './modules/auth/auth.router';
import catalogueRouter from './modules/catalogue/catalogue.router';
import cartRouter from './modules/cart/cart.router';
import wishlistRouter from './modules/wishlist/wishlist.router';
import ordersRouter from './modules/orders/orders.router';
import paymentsRouter from './modules/payments/payments.router';
import rewardsRouter from './modules/rewards/rewards.router';
import chatRouter from './modules/chat/chat.router';
import adminRouter from './modules/admin/admin.router';
import reviewsRouter from './modules/reviews/reviews.router';
import deliveryRouter from './modules/delivery/delivery.router';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ─── Request Parsing ───────────────────────────────────────────────────────

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────

app.use(morgan(env.isDevelopment ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ─── Static Files ─────────────────────────────────────────────────────────

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}`, catalogueRouter);
app.use(`${API_PREFIX}/cart`, cartRouter);
app.use(`${API_PREFIX}/wishlist`, wishlistRouter);
app.use(`${API_PREFIX}/checkout`, (req, _res, next) => {
  req.url = '/checkout' + req.url;
  next();
}, ordersRouter);
app.use(`${API_PREFIX}/orders`, ordersRouter);
app.use(`${API_PREFIX}/payments`, paymentsRouter);
app.use(`${API_PREFIX}/rewards`, rewardsRouter);
app.use(`${API_PREFIX}/chat`, chatRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/products`, reviewsRouter);
app.use(`${API_PREFIX}/delivery`, deliveryRouter);

// User profile
app.get(`${API_PREFIX}/users/profile`, async (req, res) => {
  res.json({ message: 'Use /auth/me for user profile' });
});

// ─── Swagger Docs ─────────────────────────────────────────────────────────

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vaish&Co. API',
      version: '1.0.0',
      description: 'E-commerce API for Vaish&Co. — Little things, lovely finds.',
    },
    servers: [{ url: `http://localhost:${env.PORT}${API_PREFIX}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.router.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health Check ─────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Vaish&Co. API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health',
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────

app.use(errorHandler);

export default app;
