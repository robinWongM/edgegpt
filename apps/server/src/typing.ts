import { z } from "zod";

export const Conversation = z.object({
  conversationId: z.string(), // "51D|BingProd|<64-digit-hex-string>"
  clientId: z.string(), // 16-digit-integer
  conversationSignature: z.string(),
});
export type Conversation = z.infer<typeof Conversation>;

export const CreateConversationResponse = Conversation.extend({
  result: z.object({
    value: z.string(), // "Success"
    message: z.any(),
  }),
});
export type CreateConversationResponse = z.infer<
  typeof CreateConversationResponse
>;

export const ChatHubContext = Conversation.extend({
  invocationId: z.string(), // 16-digit-integer
  tone: z
    .enum(["balanced", "creative", "precise"])
    .optional()
    .default("balanced"),
});
export type ChatHubContext = z.infer<typeof ChatHubContext>;

interface ChatHubResponse1 {
  type: 1;
  target: "update";
  arguments: {
    messages: ChatHubMessage[];
    requestId: string;
  }[];
}

enum ResultType {
  /** Client-side extension to account for cases where the `value` property of
   * the result is undefined. */
  Unknown = "Unknown",
  /** Yay! */
  Success = "Success",
  /** INLINE: It looks like your last message didn't get sent. Would you like to re-send? */
  InternalError = "InternalError",
  /** INLINE: Sorry, it looks like you've been signed out. Please sign-in again. */
  InvalidSession = "InvalidSession",
  /** INLINE: Sorry, it looks like something went wrong. Let's start over. */
  ConfigurationError = "ConfigurationError",
  /** INLINE: Sorry, it looks like something went wrong. Let's start over. */
  InvalidRequest = "InvalidRequest",
  /** Sorry, it looks like you've been signed out. Please sign-in again. */
  UnauthorizedRequest = "UnauthorizedRequest",
  /** ??? */
  Canceled = "Canceled",
  /** Apologies, but it looks like you’ve reached your daily limit. Let's chat again soon! */
  Throttled = "Throttled",
}

enum ContentOriginType {
  /** AnnRules */
  AnnRules = "AnnRules",
  /** Apology */
  Apology = "Apology",
  /** BingContent */
  BingContent = "Bing Content",
  /** Chitchat */
  Chitchat = "Chitchat",
  /** NluDirectResponse */
  NluDirectResponse = "NluDirectResponse",
  /** Qna */
  Qna = "Qna",
  /** TopicChanger */
  TopicChanger = "TopicChanger",
  /** Delighterdluni */
  Delighterdluni = "Delighterdluni",
  /** DeepLeo */
  DeepLeo = "DeepLeo",
}

enum InputMethod {
  /** Keyboard */
  Keyboard = "Keyboard",
  /** Speech */
  Speech = "Speech",
}

interface ChatHubResponse2 {
  type: 2;
  invocationId: string;
  item: {
    messages: ChatHubMessage[];
    firstNewMessageIndex: number;
    conversationId: string;
    requestId: string;
    conversationExpiryTime: string;
    telemetry: {
      metrics: null;
      startTime: string;
    };
    throttling: {
      maxNumUserMessagesInConversation: number;
      numUserMessagesInConversation: number;
    };
    result: {
      value: ResultType;
    };
  };
}

interface AdaptiveCardTextBlock {
  type: "TextBlock";
  text: string;
}

interface AdaptiveCardRichTextBlock {
  type: "RichTextBlock";
  inlines: (
    | {
        type: "TextRun";
        text: string;
      }
    | string
  )[];
}

interface AdaptiveCard {
  body: (AdaptiveCardTextBlock | AdaptiveCardRichTextBlock)[];
}

interface ChatHubMessage {
  text: string;
  hiddenText?: string;
  author: "user" | "bot";
  createdAt: string;
  timestamp: string;
  messageId: string;
  messageType: "text" | "suggestedResponse";
  offense: "None";
  adaptiveCards: AdaptiveCard[];
  sourceAttributions: unknown[];
  feedback: any;
  contentOrigin: ContentOriginType;
  privacy: unknown;
  inputMethod?: InputMethod;
  suggestedResponses?: Omit<ChatHubMessage, "suggestedResponses">[];
  spokenText?: string;
}

export type ChatHubResponse = ChatHubResponse1 | ChatHubResponse2;
