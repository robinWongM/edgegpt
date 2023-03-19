import { useStorage } from '@vueuse/core';

// eslint-disable-next-line react-hooks/rules-of-hooks
const bingCookies = useStorage('bing-cookies', '');

export const useBingCookies = () => {
  return {
    get: () => bingCookies.value,
    set: (cookies: string) => {
      bingCookies.value = cookies;
    },
  }
}