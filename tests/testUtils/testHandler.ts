import type { IncomingMessage, ServerResponse } from 'http';
import Fastify, { FastifyInstance, FastifyPluginCallback } from 'fastify';
import supertest from 'supertest';

type TestPlugin = FastifyPluginCallback;

interface CreateTestApp {
  (...plugins: TestPlugin[]): FastifyInstance;
  (mappings: Record<string, TestPlugin>): FastifyInstance;
}

export const createTestApp: CreateTestApp = (mappingsOrFirstPlugin: Record<string, TestPlugin> | TestPlugin, ...restOfPlugins: TestPlugin[]) => {
  const app = Fastify();

  if (typeof mappingsOrFirstPlugin === 'object') {
    const mappings = mappingsOrFirstPlugin;

    for (const [path, plugin] of Object.entries(mappings)) {
      app.register(plugin, { prefix: path });
    }
  } else {
    const plugins = [mappingsOrFirstPlugin, ...restOfPlugins];

    for (const plugin of plugins) {
      app.register(plugin);
    }
  }

  return app;
};

const isFastifyApp = (value: TestPlugin | FastifyInstance): value is FastifyInstance => typeof (value as FastifyInstance).ready === 'function';

interface TestHandler {
  (plugin: TestPlugin): supertest.SuperTest<supertest.Test>;
  (testApp: FastifyInstance): supertest.SuperTest<supertest.Test>;
}

export const testHandler: TestHandler = (pluginOrApp: TestPlugin | FastifyInstance) => {
  const app = isFastifyApp(pluginOrApp) ? pluginOrApp : createTestApp(pluginOrApp);

  return supertest(async (req: IncomingMessage, res: ServerResponse) => {
    await app.ready();
    app.server.emit('request', req, res);
  });
};
