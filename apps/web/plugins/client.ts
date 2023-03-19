import { createTRPCNuxtClient } from "trpc-nuxt/client";

import type { AppRouter } from "server/src/router";
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
          url: `ws://localhost:8080/trpc`,
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
