import { initTRPC } from "@trpc/server";
import { observable, Observer } from "@trpc/server/observable";
import { z } from "zod";
import { ofetch } from "ofetch";
import ws from "ws";
import EventEmitter from "node:events";
import { randomBytes, randomUUID } from "node:crypto";

const endpoints = {
  createConversation:
    "https://edgeservices.bing.com/edgesvc/turing/conversation/create",
  chatHub: "wss://sydney.bing.com/sydney/ChatHub",
};

export const t = initTRPC.create();

const Conversation = z.object({
  conversationId: z.string(), // "51D|BingProd|<64-digit-hex-string>"
  clientId: z.string(), // 16-digit-integer
  conversationSignature: z.string(),
  invocationId: z.string(), // "0"
});
type Conversation = z.infer<typeof Conversation>;

const MSG_SPLITTER = "\u001e";

class BingWebSocket extends EventEmitter {
  private connection: ws;
  private status: "connecting" | "handshaking" | "connected" | "sent";
  private pingTimerId: NodeJS.Timer | null = null;

  constructor(private conversation: Conversation) {
    super();

    this.connection = new ws(endpoints.chatHub);
    this.status = "connecting";

    this.connection.on("open", this.onOpen.bind(this));
    this.connection.on("message", this.onMessage.bind(this));
  }

  sendChatMessage(message: string) {
    if (this.status !== "connected") {
      throw new Error(
        "Cannot send message before connection is established or after an message has been sent"
      );
    }

    this.wsSend({
      arguments: [
        {
          source: "cib",
          optionsSets: [
            "nlu_direct_response_filter",
            "deepleo",
            "disable_emoji_spoken_text",
            "responsible_ai_policy_235",
            "enablemm",
            "blocklistv2",
            "jbf",
            "vpnthrottle",
            "wlthrottle",
            "dl_edge_prompt",
            "dv3sugg",
            "galileo",
            "",
            "glprompt",
          ],
          allowedMessageTypes: [
            "Chat",
            "InternalSearchQuery",
            "InternalSearchResult",
            "Disengaged",
            "InternalLoaderMessage",
            "RenderCardRequest",
            "AdsQuery",
            "SemanticSerp",
            "GenerateContentQuery",
            "SearchQuery",
          ],
          sliceIds: [
            "0310wlthrot",
            "0312vpnthro",
            "302blocklist",
            "308enbsd",
            "308jbf2",
            "314glprompt",
            "315saharauns0",
            "linkimgintf",
            "sydpayajaxlog",
            "308sdcnt2",
          ],
          traceId: randomBytes(16).toString("hex"),
          isStartOfSession: this.conversation.invocationId === "0",
          message: {
            // locale: "en-US",
            // market: "en-US",
            // region: "JP",
            timestamp: new Date().toISOString(),
            author: "user",
            inputMethod: "Keyboard",
            text: message,
            messageType: "Chat",
          },
          conversationSignature: this.conversation.conversationSignature,
          participant: { id: this.conversation.clientId }, // clientId
          conversationId: this.conversation.conversationId,
        },
      ],
      invocationId: this.conversation.invocationId,
      target: "chat",
      type: 4,
    });
  }

  private onOpen() {
    this.wsSend({
      protocol: "json",
      version: 1,
    });
    this.status = "handshaking";
  }

  private onMessage(data: Buffer) {
    if (this.status === "handshaking") {
      this.status = "connected";
      this.pingTimerId = setInterval(() => {
        this.wsSend({ type: 6 });
      }, 15 * 1000);

      this.emit("ready");

      return;
    }

    const packets = data.toString().split(MSG_SPLITTER).slice(0, -1);
    const parsed = packets.map((packet) => {
      try {
        return JSON.parse(packet);
      } catch (e) {
        return packet;
      }
    });

    for (const packet of parsed) {
      this.emit("message", packet);

      if (packet.type === 2) {
        this.connection.close();

        if (this.pingTimerId) {
          clearInterval(this.pingTimerId);
        }

        this.emit("done", packet.invocationId);
      }

      console.log(packet);
    }
  }

  private wsSend(data: any) {
    const serialized = Buffer.from(JSON.stringify(data) + MSG_SPLITTER);
    console.log(serialized);
    this.connection.send(serialized);
  }
}

const handleChatProgress = (
  message: string,
  connection: BingWebSocket,
  emit: Observer<unknown, unknown>
) => {
  connection.once("ready", () => connection.sendChatMessage(message));

  connection.on("message", (data) => {
    emit.next({ type: "message", data });
  });

  connection.once("done", (invocationId) => {
    emit.next({ type: "done", invocationId });
    emit.complete();
  });
};

export const appRouter = t.router({
  start: t.procedure
    .input(
      z.object({
        cookies: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { cookies } = input;

      const conversation = await ofetch<Omit<Conversation, "invocationId">>(
        endpoints.createConversation,
        {
          method: "GET",
          headers: {
            Cookie: cookies,
            referer:
              "https://edgeservices.bing.com/edgesvc/chat?clientscopes=chat,noheader&udsframed=1&form=SHORUN&lightschemeovr=1",
            "sec-ch-ua":
              '"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent":
              "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36 Edg/111.0.1661.41",
            "x-ms-client-request-id": randomUUID(),
            "x-ms-useragent":
              "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32",
          },
        }
      );

      console.log(conversation);

      return {
        conversationId: conversation.conversationId,
        clientId: conversation.clientId,
        conversationSignature: conversation.conversationSignature,
      };
    }),

  chat: t.procedure
    .input(
      z.object({
        message: z.string(),
        conversation: Conversation,
      })
    )
    .subscription(({ input }) => {
      const { message, conversation } = input;

      const connection = new BingWebSocket(conversation);

      return observable((emit) => {
        handleChatProgress(message, connection, emit);
      });
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
