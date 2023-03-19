<script setup lang="ts">
import FluentAdd24Filled from "~icons/fluent/add-24-filled";
import FluentPen16Filled from '~icons/fluent/pen-16-filled'

definePageMeta({
  keepalive: true,
});

const route = useRoute();
const chatId = Array.isArray(route.params.id) ? route.params.id[0] : "";
const chatList = useChatList();

if (!chatList[chatId]) {
  await navigateTo("/chat");
}

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
          <li class="my-2">
            <a :class="isActiveChat('') ? 'active' : ''" @click="openChat('')">
              <FluentAdd24Filled /> New Chat
            </a>
          </li>
          <li v-for="(chat, id) in chatList" :key="id" class="my-2">
            <a
              class="inline-flex"
              :class="isActiveChat(id) ? 'active' : ''"
              @click="openChat(id)"
            >
              <span class="flex-1">
                {{ chat.metadata.title ?? "New Chat" }}
              </span>
              <a class="btn btn-circle btn-xs btn-ghost">
                <FluentPen16Filled />
              </a>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
