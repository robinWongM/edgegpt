import { defineNuxtConfig } from "nuxt/config";
import { presetUno, transformerDirectives } from "unocss";
import { presetDaisy } from "unocss-preset-daisy";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ["trpc-nuxt"],
  },
  ssr: false,
  modules: [
    "@unocss/nuxt",
    [
      "unplugin-icons/nuxt",
      {
        autoInstall: true,
      },
    ],
  ],
  unocss: {
    transformers: [transformerDirectives()],
    presets: [presetUno(), presetDaisy()],
  },
  css: [
    "@unocss/reset/tailwind.css",
    "@kidonng/daisyui/index.css",
    "@kidonng/daisyui/themes/winter.css",
    "uno.css",
  ],
  vite: {
    define: {
      "process.env": {},
    },
  },
});
