import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "@/test/pglite-db";
import { createGuestbook, type Guestbook } from "./guestbook";

const MINUTE = 60 * 1000;
const START = new Date("2026-09-30T05:00:00Z");

let db: TestDb;
let guestbook: Guestbook;
/** 테스트가 옮길 수 있는 현재 시각 */
let now: Date;
const advance = (minutes: number) => {
  now = new Date(now.getTime() + minutes * MINUTE);
};

beforeAll(async () => {
  db = await createTestDb();
  guestbook = createGuestbook(db, { now: () => now });
});

beforeEach(async () => {
  await db.reset();
  now = START;
});

describe("글 남기기와 목록", () => {
  it("남긴 Entry가 이름·메시지·작성 시각을 가진 채 목록에 나오고, 수정됨이 아니다", async () => {
    await guestbook.create({ name: "이주표", message: "안녕하세요!", password: "1234" });

    const entries = await guestbook.list();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      name: "이주표",
      message: "안녕하세요!",
      createdAt: START,
      edited: false,
    });
  });

  it("여러 Entry는 작성 시각 최신순으로 나온다", async () => {
    await guestbook.create({ name: "첫째", message: "1", password: "1234" });
    advance(1);
    await guestbook.create({ name: "둘째", message: "2", password: "1234" });
    advance(1);
    await guestbook.create({ name: "셋째", message: "3", password: "1234" });

    const names = (await guestbook.list()).map((e) => e.name);

    expect(names).toEqual(["셋째", "둘째", "첫째"]);
  });

  it("같은 시각에 남긴 Entry는 나중에 남긴 것이 먼저 나온다", async () => {
    await guestbook.create({ name: "먼저", message: "1", password: "1234" });
    await guestbook.create({ name: "나중", message: "2", password: "1234" });

    const names = (await guestbook.list()).map((e) => e.name);

    expect(names).toEqual(["나중", "먼저"]);
  });

  it("목록의 Entry에는 글 비밀번호가 들어 있지 않다", async () => {
    await guestbook.create({ name: "이주표", message: "hi", password: "secret-pw" });

    const [entry] = await guestbook.list();

    expect(Object.keys(entry).sort()).toEqual(["createdAt", "edited", "id", "message", "name"]);
  });
});

describe("글 비밀번호 저장", () => {
  // 원문이 어디에도 없다는 것은 인터페이스로 볼 수 없는 보안 속성이라, 여기서만 저장된 행을 직접 들여다본다.
  it("저장된 행에 원문이 없고, 같은 비밀번호로 쓴 두 Entry의 해시가 서로 다르다", async () => {
    await guestbook.create({ name: "가", message: "1", password: "same-password" });
    await guestbook.create({ name: "나", message: "2", password: "same-password" });

    const rows = await db.query<{ password_hash: string }>("select password_hash from entries");

    expect(rows).toHaveLength(2);
    for (const row of rows) expect(row.password_hash).not.toContain("same-password");
    expect(rows[0].password_hash).not.toBe(rows[1].password_hash);
  });
});
