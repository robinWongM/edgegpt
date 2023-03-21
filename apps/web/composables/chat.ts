import { MaybeRef } from "@vueuse/core";

/* eslint-disable react-hooks/rules-of-hooks */
const chatStorage: Record<string, Chat> = reactive({});

interface Chat {
  metadata: ChatMetadata;
  messages: ChatMessage[];
  status: ChatStatus;

  send: (message: string, pageContent?: string) => void;
}

interface ChatMetadata {
  conversationId: string;
  conversationSignature: string;
  clientId: string;

  title?: string;
  tone?: "balanced" | "creative" | "precise";
}

interface ChatStatus {
  idStatus: "inactive" | "pending" | "active";
  canSend: boolean;
}

export interface ChatMessage {
  id: string;
  author: "user" | "bot" | "system";
  text: string;
  timestamp: number;
  suggestions?: string[];
}

const createEmptyChat = () => {
  const invocationId = ref(-1);

  const metadata = reactive<ChatMetadata>({
    conversationId: "",
    conversationSignature: "",
    clientId: "",

    title: "New Chat",
    tone: "balanced",
  });
  const status = reactive<ChatStatus>({
    idStatus: "inactive",
    canSend: true,
  });
  const messages = reactive<ChatMessage[]>([]);

  return {
    invocationId,
    metadata,
    status,
    messages,
    send: (_: string) => {},
  }
}

const DEFAULT_EMPTY_CHAT = createEmptyChat();

export const useChatList = () => chatStorage;

export const useChat = (keyRef: MaybeRef<string>) => {
  const key = unref(keyRef);

  if (chatStorage[key]) {
    // This is an existing conversation
    return chatStorage[key];
  }

  if (!key) {
    return DEFAULT_EMPTY_CHAT;
  }

  const { invocationId, metadata, status, messages } = createEmptyChat();

  chatStorage[unref(key)] = {
    metadata,
    status,
    messages,
    send,
  };

  return chatStorage[unref(key)];

  async function start() {
    if (status.idStatus !== "inactive") {
      return;
    }

    status.idStatus = "pending";

    const data = await useNuxtApp().$client.start.mutate({
      cookies: useBingCookies().get(),
    });

    metadata.conversationId = data.conversationId;
    metadata.conversationSignature = data.conversationSignature;
    metadata.clientId = data.clientId;

    status.idStatus = "active";
  }

  async function send(text: string, pageContent?: string) {
    if (!status.canSend) {
      return;
    }
    status.canSend = false;

    addLocalMessage(text, "user");

    if (status.idStatus !== "active") {
      try {
        await start();
      } catch (e: any) {
        addLocalMessage(`Error: ${e.message}`, "system");

        status.idStatus = "inactive";
        status.canSend = true;

        return;
      }
    }
    invocationId.value += 1;

    const subscription = useNuxtApp().$client.chat.subscribe(
      {
        message: text,
        context: {
          ...metadata,
          invocationId: `${invocationId.value}`,
        },
        pageContent,
      },
      {
        onData: (data: any) => processResponse(data, subscription),
        onComplete: () => {
          status.canSend = true;
        },
        onStopped: () => {
          status.canSend = true;
        },
        onError: (error: any) => {
          addLocalMessage(`Error: ${error.message}`, "system");
          status.canSend = true;
        },
      }
    );
  }

  function addLocalMessage(text: string, author: "user" | "system") {
    messages.push({
      id: crypto.randomUUID(),
      author,
      text,
      timestamp: +new Date(),
    });
  }

  function processResponse(response: any, subscription: { unsubscribe: () => void }) {
    if (response.type === "done") {
      const { value, message } = response.metadata.result ?? {};
      if (value !== "Success") {
        addLocalMessage(`Error (${value}): ${message}`, "system");
      }

      subscription.unsubscribe();
      status.canSend = true;
      return;
    }

    if (response.type === "message") {
      const existingMessageIndex = messages.findIndex(
        (message) => message.id === response.message.id
      );

      if (existingMessageIndex !== -1) {
        messages[existingMessageIndex] = {
          ...messages[existingMessageIndex],
          ...response.message,
        };
        return;
      }

      messages.push({
        ...response.message,
        author: "bot",
      });
    }
  }
};
