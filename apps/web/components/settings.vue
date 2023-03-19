<script setup lang="ts">
import FluentSettings16Regular from "~icons/fluent/settings-16-regular";

const modalId = "modal-settings";

const { get, set } = useBingCookies();
const cookiesInput = ref(get());
const ok = () => set(cookiesInput.value);
const cancel = () => (cookiesInput.value = get());
</script>

<template>
  <!-- The button to open modal -->
  <label :for="modalId" class="btn btn-ghost btn-circle">
    <FluentSettings16Regular class="w-6 h-6" />
  </label>

  <Modal :id="modalId" title="Settings">
    <div class="w-full pt-4">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Bing Cookies</span>
        </label>
        <input
          type="text"
          placeholder="_U=xxxx;"
          class="input input-bordered w-full"
          v-model="cookiesInput"
        />
        <label class="label">
          <span class="label-text-alt">
            You can find this in your browser cookies (domain: bing.com) after
            you login to your Microsoft account. Note that your account must
            have access to the New Bing.
          </span>
        </label>
      </div>
    </div>
    <template #action>
      <label :for="modalId" class="btn btn-ghost" @click="cancel">Cancel</label>
      <label :for="modalId" class="btn btn-primary" @click="ok">OK</label>
    </template>
  </Modal>
</template>
