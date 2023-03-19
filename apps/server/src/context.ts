import { inferAsyncReturnType } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return { req, res, logger: req.log };
}

export type Context = inferAsyncReturnType<typeof createContext>;
