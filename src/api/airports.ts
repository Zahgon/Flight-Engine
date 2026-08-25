import { FastifyPluginCallback } from 'fastify';
import { airports } from '../data/airports';

function validAirportRegex(code: string) {
  const matchedCodes = code.match(/^[A-Z]{3}$/gi);
  return matchedCodes?.[0] === code;
}

export const airportRouter: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get('/', (request, reply) => {
    const { code } = request.query as { code?: string };
    if (!code || !validAirportRegex(code.toString())) {
      void reply.status(400).send('Please enter a valid flight code i.e. DFW, GSO, ATL...');
      return;
    }

    const airport = airports.find((port) => port.code.toLowerCase() === code.toString().toLowerCase());

    if (airport) {
      void reply.send(airport);
    } else {
      void reply.status(404).send('Airport not found');
    }
  });

  fastify.get('/all', (_request, reply) => {
    void reply.send(airports);
  });

  done();
};
