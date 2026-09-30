import { describe, expect, it } from "vitest";
import { formatKst } from "./kst";

describe("작성 시각 표시 (KST)", () => {
  it("UTC 시각을 한국 시간 YYYY-MM-DD HH:mm으로 보여준다", () => {
    expect(formatKst(new Date("2026-09-30T05:05:00Z"))).toBe("2026-09-30 14:05");
  });

  it("UTC로 자정 직전이면 한국 시간으로는 다음 날이다", () => {
    expect(formatKst(new Date("2026-09-30T23:59:00Z"))).toBe("2026-10-01 08:59");
  });

  it("한국 시간 자정은 00시로 보여준다", () => {
    expect(formatKst(new Date("2026-09-30T15:00:00Z"))).toBe("2026-10-01 00:00");
  });
});
