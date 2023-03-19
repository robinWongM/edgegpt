<script setup lang="ts">
definePageMeta({
  keepalive: true,
})

const route = useRoute();

const chatId = Array.isArray(route.params.id) ? route.params.id[0] : "";
provide(
  "chatId",
  computed(() => chatId)
);

const chatList = useChatList();
const isActiveChat = (linkChatId: string) => linkChatId === chatId;
const openChat = async (linkChatId: string) => {
  await navigateTo(`/chat/${linkChatId}`);
};
</script>

<template>
  <div class="drawer drawer-mobile">
    <input id="drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <Chat :chat-id="chatId" />
    </div>
    <div class="drawer-side">
      <label for="drawer" class="drawer-overlay"></label>
      <div
        class="flex flex-col justify-between gap-10 px-2 py-4 w-80 overflow-y-auto bg-base-200"
      >
        <ul class="menu w-full px-2 rounded-box overflow-y-auto flex-nowrap">
          <li v-for="(chat, id) in chatList" :key="id">
            <a :class="isActiveChat(id) ? 'active' : ''" @click="openChat(id)">
              {{ chat.metadata.title ?? 'New Chat' }}
            </a>
          </li>
        </ul>
        <ul class="flex-0 menu w-full px-2 rounded-box">
          <li><Settings /></li>
        </ul>
      </div>
    </div>
  </div>
</template>
