/* istanbul ignore file */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './env';
import { logger } from './logger';
import { flights } from './api/flights';
import { airportRouter } from './api/airports';

const port = env.port || '4000';

const app = Fastify();

void app.register(cors, { strictPreflight: false });

app.get('/', (_request, reply) => {
  void reply.send('👋');
});

void app.register(flights, { prefix: '/flights' });

void app.register(airportRouter, { prefix: '/airports' });

app.listen({ port: Number(port), host: '0.0.0.0' }, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.notice(`🚀 Listening at http://localhost:${port}`);
});
