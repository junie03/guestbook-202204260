import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // 도메인 모듈은 "server-only"로 클라이언트 번들 유입을 막는다. 테스트(Node)에서는 빈 모듈로 대신한다.
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
  },
});
