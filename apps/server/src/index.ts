import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify, { FastifyInstance } from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import cors from "@fastify/cors";
import ws from "@fastify/websocket";

declare global {
  var server: FastifyInstance | undefined;
}

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

export const server = fastify({
  maxParamLength: 5000,
  logger: envToLogger[process.env.NODE_ENV] ?? true,
});

server.register(cors);
server.register(ws);
server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
  useWSS: true,
});

(async () => {
  try {
    if (globalThis.server) {
      globalThis.server.log.info('Closing previous server...');
      await globalThis.server.close();
    }
    globalThis.server = server;

    await server.listen({ port: 8080 });
  } catch (err) {
    server.log.error(err);
  }
})();
