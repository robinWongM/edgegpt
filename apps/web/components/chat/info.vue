<script setup lang="ts">
import FluentInfo16Regular from "~icons/fluent/info-16-regular";

const chatId = inject<Ref<string>>("chatId");
const { metadata, status } = useChat(chatId!);

const modalId = computed(() => `chat-info-${chatId!.value}`);
</script>

<template>
  <label :for="modalId" class="btn btn-ghost btn-circle">
    <FluentInfo16Regular class="w-6 h-6" />
  </label>
  <Modal :id="modalId" title="Info">
    <pre class="font-mono mt-4 whitespace-pre-wrap break-all">
conversationId: {{ metadata.conversationId }}
clientId: {{ metadata.clientId }}
conversationSignature: {{ metadata.conversationSignature }}

idStatus: {{ status.idStatus }}
canSend: {{ status.canSend }}</pre>
    <template #action>
      <label :for="modalId" class="btn btn-primary">OK</label>
    </template>
  </Modal>
</template>
