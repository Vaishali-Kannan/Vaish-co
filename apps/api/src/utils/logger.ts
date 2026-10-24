import winston from 'winston';
import env from '../config/env';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const devFormat = combine(
  errors({ stack: true }),
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

const prodFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

const logger = winston.createLogger({
  level: env.isDevelopment ? 'debug' : 'info',
  format: env.isDevelopment ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
