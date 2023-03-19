import { randomUUID } from "node:crypto";

export const endpoints = {
  createConversation:
    "https://edgeservices.bing.com/edgesvc/turing/conversation/create",
  chatHub: "wss://sydney.bing.com/sydney/ChatHub",
};

export const referer = "https://edgeservices.bing.com/edgesvc/chat?clientscopes=chat,noheader&udsframed=1&form=SHORUN&lightschemeovr=1";

export const getEdgeHeaders = () => ({
  referer,
  "sec-ch-ua":
    '"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent":
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36 Edg/111.0.1661.41",
  "x-ms-client-request-id": randomUUID(),
  "x-ms-useragent":
    "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32",
});

export const toneOptions = {
  balanced: ["galileo"],
  creative: ["h3imaginative", "clgalileo"],
  precise: ["h3precise", "clgalileo"],
} as const;