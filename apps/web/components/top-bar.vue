<script setup lang="ts">
const chatId = inject<Ref<string>>("chatId");
const { metadata } = useChat(chatId!);
</script>

<template>
  <div class="navbar">
    <div class="navbar-start">
      <label
        for="drawer"
        class="btn btn-ghost btn-circle drawer-button lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </label>
    </div>
    <div class="navbar-center lg:hidden">
      <span class="normal-case text-xl">
        {{ metadata.title ?? "New Chat" }}
      </span>
    </div>
    <div class="navbar-end">
      <Settings />
      <ChatInfo />
    </div>
  </div>
</template>
