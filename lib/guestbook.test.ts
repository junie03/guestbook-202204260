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

describe("입력값 검증", () => {
  const valid = { name: "이주표", message: "안녕하세요", password: "1234" };

  it("이름이 비어 있으면 거부되고 아무것도 저장되지 않는다", async () => {
    const result = await guestbook.create({ ...valid, name: "" });

    expect(result).toEqual({ ok: false, errors: { name: "이름은 1~20자로 입력해 주세요." } });
    expect(await guestbook.list()).toEqual([]);
  });

  const NAME_ERROR = { name: "이름은 1~20자로 입력해 주세요." };
  const MESSAGE_ERROR = { message: "메시지는 1~500자로 입력해 주세요." };
  const PASSWORD_ERROR = { password: "비밀번호는 4~30자로 입력해 주세요." };

  it.each([
    ["이름 1자", { name: "a" }],
    ["이름 20자", { name: "a".repeat(20) }],
    ["메시지 1자", { message: "a" }],
    ["메시지 500자", { message: "a".repeat(500) }],
    ["비밀번호 4자", { password: "abcd" }],
    ["비밀번호 30자", { password: "a".repeat(30) }],
  ])("%s: 허용", async (_label, override) => {
    const result = await guestbook.create({ ...valid, ...override });

    expect(result.ok).toBe(true);
  });

  it.each([
    ["이름 21자", { name: "a".repeat(21) }, NAME_ERROR],
    ["메시지 0자", { message: "" }, MESSAGE_ERROR],
    ["메시지 501자", { message: "a".repeat(501) }, MESSAGE_ERROR],
    ["비밀번호 3자", { password: "abc" }, PASSWORD_ERROR],
    ["비밀번호 31자", { password: "a".repeat(31) }, PASSWORD_ERROR],
  ])("%s: 거부", async (_label, override, errors) => {
    const result = await guestbook.create({ ...valid, ...override });

    expect(result).toEqual({ ok: false, errors });
    expect(await guestbook.list()).toEqual([]);
  });

  it("여러 칸이 틀리면 칸마다 오류를 돌려준다", async () => {
    const result = await guestbook.create({ name: "", message: "", password: "" });

    expect(result).toEqual({ ok: false, errors: { ...NAME_ERROR, ...MESSAGE_ERROR, ...PASSWORD_ERROR } });
  });

  it("공백만 입력한 이름·메시지는 빈 값으로 거부된다", async () => {
    const result = await guestbook.create({ ...valid, name: "   ", message: " \n\t " });

    expect(result).toEqual({ ok: false, errors: { ...NAME_ERROR, ...MESSAGE_ERROR } });
  });

  it("이름·메시지의 앞뒤 공백은 지워져 저장되고, 메시지 안의 줄바꿈은 남는다", async () => {
    await guestbook.create({ ...valid, name: "  이주표  ", message: "\n  첫 줄\n둘째 줄  \n" });

    const [entry] = await guestbook.list();

    expect(entry).toMatchObject({ name: "이주표", message: "첫 줄\n둘째 줄" });
  });

  it("한글은 한 글자를 1자로 센다", async () => {
    const twenty = "가".repeat(20);

    expect((await guestbook.create({ ...valid, name: twenty })).ok).toBe(true);
    expect(await guestbook.create({ ...valid, name: twenty + "가" })).toEqual({ ok: false, errors: NAME_ERROR });
  });

  it("비밀번호는 공백을 지우지 않고 그대로 센다", async () => {
    // 공백 4개도 4자짜리 비밀번호다
    expect((await guestbook.create({ ...valid, password: "    " })).ok).toBe(true);
    // " ab "는 4자로 허용되지만, 공백을 지운 "ab"로 세면 거부되었을 것이다
    expect((await guestbook.create({ ...valid, password: " ab " })).ok).toBe(true);
  });
});

/** 테스트용: Entry 하나를 남기고 그 Entry를 돌려준다 */
async function leave(name: string, message = "원래 메시지", password = "1234") {
  const result = await guestbook.create({ name, message, password });
  if (!result.ok) throw new Error("테스트 준비 실패: 유효한 입력이어야 한다");
  return result.entry;
}

describe("메시지 수정", () => {
  it("맞는 비밀번호로 수정하면 메시지가 바뀌고 수정됨이 되며, 이름과 작성 시각은 그대로다", async () => {
    const entry = await leave("이주표");
    advance(10);

    const result = await guestbook.edit(entry.id, { message: "고친 메시지", password: "1234" });

    expect(result.ok).toBe(true);
    const [edited] = await guestbook.list();
    expect(edited).toMatchObject({ id: entry.id, name: "이주표", message: "고친 메시지", createdAt: START, edited: true });
  });

  it("수정한 오래된 Entry는 목록에서 제자리를 지킨다", async () => {
    const old = await leave("오래된 글");
    advance(1);
    await leave("새 글");
    advance(1);

    await guestbook.edit(old.id, { message: "고침", password: "1234" });

    expect((await guestbook.list()).map((e) => e.name)).toEqual(["새 글", "오래된 글"]);
  });

  it("틀린 비밀번호는 거부되고 Entry는 바뀌지 않는다", async () => {
    const entry = await leave("이주표", "원래 메시지", "right-pw");

    const result = await guestbook.edit(entry.id, { message: "몰래 고침", password: "wrong-pw" });

    expect(result).toEqual({ ok: false, reason: "wrong_password" });
    expect((await guestbook.list())[0]).toMatchObject({ message: "원래 메시지", edited: false });
  });

  it("없는 Entry를 수정하면 not_found", async () => {
    const result = await guestbook.edit(999, { message: "고침", password: "1234" });

    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it.each([
    ["빈 메시지", ""],
    ["공백뿐", "   "],
    ["501자", "a".repeat(501)],
  ])("메시지가 %s이면 수정이 거부되고 Entry는 바뀌지 않는다", async (_label, message) => {
    const entry = await leave("이주표");

    const result = await guestbook.edit(entry.id, { message, password: "1234" });

    expect(result).toEqual({ ok: false, reason: "invalid", errors: { message: "메시지는 1~500자로 입력해 주세요." } });
    expect((await guestbook.list())[0]).toMatchObject({ message: "원래 메시지", edited: false });
  });

  it("수정한 메시지도 앞뒤 공백이 지워져 저장된다", async () => {
    const entry = await leave("이주표");

    const result = await guestbook.edit(entry.id, { message: "  고친 메시지  ", password: "1234" });

    expect(result).toMatchObject({ ok: true, entry: { message: "고친 메시지" } });
  });
});
