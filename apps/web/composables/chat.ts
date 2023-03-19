import { MaybeRef } from "@vueuse/core";

/* eslint-disable react-hooks/rules-of-hooks */
const chatStorage: Record<string, Chat> = reactive({});

interface Chat {
  metadata: ChatMetadata;
  messages: ChatMessage[];
  status: ChatStatus;

  send: (message: string) => void;
}

interface ChatMetadata {
  conversationId: string;
  conversationSignature: string;
  clientId: string;

  title?: string;
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

export const useChatList = () => chatStorage;

export const useChat = (key: MaybeRef<string>) => {
  if (chatStorage[unref(key)]) {
    // This is an existing conversation
    return chatStorage[unref(key)];
  }

  const invocationId = ref(-1);

  const metadata = reactive<ChatMetadata>({
    conversationId: "",
    conversationSignature: "",
    clientId: "",
  });
  const status = reactive<ChatStatus>({
    idStatus: "inactive",
    canSend: true,
  });
  const messages = reactive<ChatMessage[]>([]);

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

  async function send(text: string) {
    if (!status.canSend) {
      return;
    }
    status.canSend = false;

    addLocalMessage(text, "user");

    if (status.idStatus !== "active") {
      try {
        await start();
      } catch (e) {}
    }
    invocationId.value += 1;

    useNuxtApp().$client.chat.subscribe(
      {
        message: text,
        context: { ...metadata, invocationId: `${invocationId.value}` },
      },
      {
        onData: (data: any) => processResponse(data),
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

  function processResponse(response: any) {
    if (response.type === "done") {
      const { value, message } = response.metadata.result ?? {};
      if (value !== "Success") {
        addLocalMessage(`Error (${value}): ${message}`, "system");
      }

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
