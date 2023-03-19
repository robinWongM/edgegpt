import { initTRPC } from "@trpc/server";
import { observable, Observer } from "@trpc/server/observable";
import { z } from "zod";
import { ofetch } from "ofetch";
import { endpoints } from "../bing";
import { ChatHubContext, CreateConversationResponse } from "./typing";
import { ChatHub } from "./chat-hub";
import { getEdgeHeaders } from "./constants";

export const t = initTRPC.create();

export const appRouter = t.router({
  start: t.procedure
    .input(
      z.object({
        cookies: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { cookies } = input;

      const resp = await ofetch<CreateConversationResponse>(
        endpoints.createConversation,
        {
          method: "GET",
          headers: {
            ...getEdgeHeaders(),
            Cookie: cookies,
          },
        }
      );
      if (resp.result.value !== "Success") {
        throw new Error(resp.result.message);
      }

      return {
        conversationId: resp.conversationId,
        clientId: resp.clientId,
        conversationSignature: resp.conversationSignature,
      };
    }),

  chat: t.procedure
    .input(
      z.object({
        message: z.string(),
        pageContent: z.string().optional(),
        context: ChatHubContext,
      })
    )
    .subscription(({ input }) => {
      const { message, pageContent, context } = input;

      const connection = new ChatHub(context);
      connection.once("ready", () => connection.sendChatMessage(message, pageContent));

      return observable((emit) => {
        connection.on("message", (botMessage) => {
          emit.next({ type: "message", message: botMessage });
        });

        connection.once("done", (metadata) => {
          emit.next({ type: "done", metadata });
        });

        return () => {
          connection.close();
        }
      });
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
