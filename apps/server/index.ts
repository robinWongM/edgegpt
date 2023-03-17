import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";

const server = fastify({
  maxParamLength: 5000,
});

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
});

(async () => {
  try {
    await server.listen({ port: 3000 });
    console.log(`EdgeGPT server is listening @ 127.0.0.1:3000`);
  } catch (err) {
    server.log.error(err);
  }
})();

// @ts-ignore
if (import.meta.hot) {
// @ts-ignore
  import.meta.hot.accept(() => {
    console.log('HMR!');
    server.close();
  });
}
