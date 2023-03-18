<script setup lang="ts">
const props = defineProps<{
  messages: any[];
}>();

const messageContent = reactive({} as Record<string, string>);
const rawMessages = computed(() => props.messages.filter(msg => msg.type === 'message' && msg.data.type === 2))


const messages = computed(() => {
  return props.messages
    .filter((msg) => msg.type === "message")
    .map((msg) => msg.data)
    .filter((msg) => msg.type === 1 && msg.target === "update")
    .map((msg) => msg.arguments?.[0]?.messages || [])
    .flat()
    .reduce((msgIds: Set<number>, msg) => {
      const id = msg.messageId;
      msgIds.add(id);
      messageContent[id] = msg.adaptiveCards?.[0]?.body?.[0]?.text || msg.text;
      return msgIds;
    }, new Set());
});
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-for="msgId in messages" :key="msgId">
      <Markdown
        class="max-w-80% bg-primary-content text-black p-4 rounded-xl mb-4"
        v-if="messageContent[msgId]"
        :content="messageContent[msgId]"
      />
    </div>
  </div>
</template>
