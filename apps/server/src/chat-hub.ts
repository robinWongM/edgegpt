import { randomBytes } from "node:crypto";
import ws from "ws";
import { EventEmitter } from "node:events";
import { endpoints } from "../bing";
import { ChatHubContext, ChatHubResponse } from "./typing";
import { toneOptions } from "./constants";

const MSG_SPLITTER = "\u001e";

export class ChatHub extends EventEmitter {
  private connection: ws;
  private status: "connecting" | "handshaking" | "connected" | "sent";
  private pingTimerId: NodeJS.Timer | null = null;

  constructor(private context: ChatHubContext) {
    super();

    this.connection = new ws(endpoints.chatHub);
    this.status = "connecting";

    this.connection.on("open", this.onOpen.bind(this));
    this.connection.on("message", this.onMessage.bind(this));
  }

  sendChatMessage(message: string, pageContent?: string) {
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
            // "blocklistv2",
            // "jbf",
            // "vpnthrottle",
            // "wlthrottle",
            "dl_edge_prompt",
            "dv3sugg",
            ...toneOptions[this.context.tone],
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
            // "0310wlthrot",
            // "0312vpnthro",
            // "302blocklist",
            // "308enbsd",
            // "308jbf2",
            // "314glprompt",
            "315saharauns0",
            "linkimgintf",
            "perfinstcf",
            "sydpayajaxlog",
            // "308sdcnt2",
          ],
          traceId: randomBytes(16).toString("hex"),
          isStartOfSession: this.context.invocationId === "0",
          message: {
            // locale: "en-US",
            // market: "en-US",
            // region: "JP",
            timestamp: new Date().toISOString(),
            author: "user",
            inputMethod: "Keyboard",
            text: message,
            messageType: "Chat",
            // messageType: "SearchQuery",
          },
          conversationSignature: this.context.conversationSignature,
          participant: { id: this.context.clientId }, // clientId
          conversationId: this.context.conversationId,

          ...(pageContent
            ? {
                previousMessages: [
                  {
                    author: "user",
                    description: pageContent,
                    contextType: "WebPage",
                    messageType: "Context",
                    messageId: "discover-web--page-ping-mriduna-----",
                  },
                ],
              }
            : {}),
        },
      ],
      invocationId: this.context.invocationId,
      target: "chat",
      type: 4,
    });
  }

  close() {
    this.connection.close();
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
    const parsed: ChatHubResponse[] = packets
      .map((packet) => {
        try {
          return JSON.parse(packet);
        } catch (e) {
          return null;
        }
      })
      .filter((packet) => packet);

    for (const packet of parsed) {
      this.onChatHubResponse(packet);
    }
  }

  private onChatHubResponse(packet: ChatHubResponse) {
    // this.emit("message", packet);

    switch (packet.type) {
      // This is a `update` packet
      case 1:
        // console.dir(packet, { depth: null });

        // It should only have one message
        const message = packet.arguments?.[0]?.messages?.[0];
        if (!message) {
          // TODO: Handle this
          return;
        }

        if (message.messageType === "RenderCardRequest") {
          return;
        }

        const simplifiedMessage = {
          id: message.messageId,
          text: message.text,
          suggestions: message.suggestedResponses?.map(
            (suggestion) => suggestion.text
          ),
        };

        if (!message.adaptiveCards?.[0]) {
          this.emit("message", simplifiedMessage);
        }

        const textBlocks = [];

        for (const block of message.adaptiveCards?.[0]?.body ?? []) {
          if (block.type === "TextBlock") {
            textBlocks.push(block.text);
          }

          if (block.type === "RichTextBlock") {
            let inlineText = "";
            for (const inline of block.inlines) {
              if (typeof inline === "string") {
                inlineText += inline;
              } else {
                inlineText += inline.text;
              }
            }
            textBlocks.push(inlineText);
          }
        }

        simplifiedMessage.text = textBlocks.join("\n---\n");
        this.emit("message", simplifiedMessage);

        break;
      case 2:
        this.emit("done", {
          result: packet.item.result,
          invocationId: packet.invocationId,
          expiryTime: packet.item.conversationExpiryTime,
          numUserMessages:
            packet.item.throttling?.numUserMessagesInConversation,
          maxUserMessages:
            packet.item.throttling?.maxNumUserMessagesInConversation,
        });

        // This is a `close` message
        this.connection.close();
        if (this.pingTimerId) {
          clearInterval(this.pingTimerId);
        }

        break;
    }

    // console.log(packet);
  }

  private wsSend(data: any) {
    const serialized = Buffer.from(JSON.stringify(data) + MSG_SPLITTER);
    console.dir(data, { depth: null });
    this.connection.send(serialized);
  }
}
