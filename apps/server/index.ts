import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { createContext } from "./context";
import { appRouter } from "./router";
import cors from "@fastify/cors";
import ws from "@fastify/websocket";

const server = fastify({
  maxParamLength: 5000,
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
    console.log("HMR!");
    server.close();
  });
}
