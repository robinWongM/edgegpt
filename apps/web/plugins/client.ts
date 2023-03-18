import { createTRPCNuxtClient, httpBatchLink } from "trpc-nuxt/client";

import type { AppRouter } from "server/router";
import { createWSClient, wsLink } from "@trpc/client";

export default defineNuxtPlugin(() => {
  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const client = createTRPCNuxtClient<AppRouter>({
    links: [
      wsLink({
        client: createWSClient({
          url: `ws://localhost:3000/trpc`,
        })
      }),
    ],
  });
  return {
    provide: {
      client,
    },
  };
});
