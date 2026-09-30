import "server-only";
import type { Db } from "./db";
import { hashPassword, verifyPassword } from "./password";

/** 목록에 보이는 Entry. 글 비밀번호(해시)는 절대 포함하지 않는다. */
export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: Date;
  edited: boolean;
};

export type EntryInput = { name: string; message: string; password: string };

export type Field = keyof EntryInput;
/** 규칙을 어긴 칸마다 안내 문구 하나 */
export type FieldErrors = Partial<Record<Field, string>>;

export type CreateResult = { ok: true; entry: Entry } | { ok: false; errors: FieldErrors };

export type EditInput = { message: string; password: string };

export type EditResult =
  | { ok: true; entry: Entry }
  | { ok: false; reason: "invalid"; errors: Pick<FieldErrors, "message"> }
  | { ok: false; reason: "wrong_password" }
  | { ok: false; reason: "not_found" };

export type RemoveResult = { ok: true } | { ok: false; reason: "wrong_password" | "not_found" };

export type Guestbook = {
  /** 규칙을 어기면 아무것도 저장하지 않고 칸별 오류를 돌려준다. */
  create(input: EntryInput): Promise<CreateResult>;
  /** 모든 Entry, 작성 시각 최신순 */
  list(): Promise<Entry[]>;
  /** 글 비밀번호가 맞으면 메시지만 바꾼다. 이름·작성 시각은 그대로다. */
  edit(id: number, input: EditInput): Promise<EditResult>;
  /** 글 비밀번호가 맞으면 Entry를 지운다. */
  remove(id: number, password: string): Promise<RemoveResult>;
};

type Row = { id: number; name: string; message: string; created_at: Date; updated_at: Date | null };

const COLUMNS = "id, name, message, created_at, updated_at";

function toEntry(row: Row): Entry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at,
    edited: row.updated_at !== null,
  };
}

const MAX_INTEGER = 2 ** 31 - 1;

/** Postgres integer 기본키가 될 수 있는 값인가 */
const isEntryId = (id: unknown): id is number => Number.isInteger(id) && (id as number) >= 1 && (id as number) <= MAX_INTEGER;

/** 글자 수는 코드포인트로 센다: 한글·이모지 한 글자가 1자 */
const length = (value: string) => [...value].length;

const within = (value: string, min: number, max: number) => length(value) >= min && length(value) <= max;

const RULE_ERRORS = {
  name: "이름은 1~20자로 입력해 주세요.",
  message: "메시지는 1~500자로 입력해 주세요.",
  password: "비밀번호는 4~30자로 입력해 주세요.",
} as const;

/** 메시지 규칙: 작성과 수정이 함께 쓴다. 앞뒤 공백을 지운 값과, 어겼다면 안내 문구를 돌려준다. */
function checkMessage(raw: string): { message: string; error?: string } {
  const message = raw.trim();
  return within(message, 1, 500) ? { message } : { message, error: RULE_ERRORS.message };
}

/** 이름·메시지는 앞뒤 공백을 지운 뒤 검사하고, 비밀번호는 공백까지 그대로 검사한다. */
function validate(input: EntryInput): { values: EntryInput; errors: FieldErrors } {
  const { message, error: messageError } = checkMessage(input.message);
  const values = { name: input.name.trim(), message, password: input.password };
  const errors: FieldErrors = {};
  if (!within(values.name, 1, 20)) errors.name = RULE_ERRORS.name;
  if (messageError) errors.message = messageError;
  if (!within(values.password, 4, 30)) errors.password = RULE_ERRORS.password;
  return { values, errors };
}

export function createGuestbook(db: Db, clock: { now: () => Date } = { now: () => new Date() }): Guestbook {
  /** 수정·삭제 공통: Entry가 있고 글 비밀번호가 맞는지 확인한다. */
  async function authorize(id: number, password: string): Promise<"ok" | "wrong_password" | "not_found"> {
    // id는 클라이언트가 조작할 수 있는 값이다. entries.id(integer)가 될 수 없는 값은 없는 글로 다룬다.
    if (!isEntryId(id)) return "not_found";
    const [found] = await db.query<{ password_hash: string }>("select password_hash from entries where id = $1", [id]);
    if (!found) return "not_found";
    return (await verifyPassword(password, found.password_hash)) ? "ok" : "wrong_password";
  }

  return {
    async create(input) {
      const { values, errors } = validate(input);
      if (Object.keys(errors).length > 0) return { ok: false, errors };
      const { name, message, password } = values;
      const [row] = await db.query<Row>(
        `insert into entries (name, message, password_hash, created_at)
         values ($1, $2, $3, $4)
         returning ${COLUMNS}`,
        [name, message, await hashPassword(password), clock.now()],
      );
      return { ok: true, entry: toEntry(row) };
    },

    async list() {
      const rows = await db.query<Row>(`select ${COLUMNS} from entries order by created_at desc, id desc`);
      return rows.map(toEntry);
    },

    async edit(id, input) {
      // 글이 있는지·비밀번호가 맞는지를 먼저 알린다: 이미 지워진 글에 메시지 규칙 안내를 보여주지 않는다.
      const auth = await authorize(id, input.password);
      if (auth !== "ok") return { ok: false, reason: auth };

      const { message, error } = checkMessage(input.message);
      if (error) return { ok: false, reason: "invalid", errors: { message: error } };

      // 비밀번호를 확인하는 사이에 지워졌다면 update가 아무 행도 돌려주지 않는다.
      const [row] = await db.query<Row>(
        `update entries set message = $2, updated_at = $3 where id = $1 returning ${COLUMNS}`,
        [id, message, clock.now()],
      );
      return row ? { ok: true, entry: toEntry(row) } : { ok: false, reason: "not_found" };
    },

    async remove(id, password) {
      const auth = await authorize(id, password);
      if (auth !== "ok") return { ok: false, reason: auth };
      // 비밀번호를 확인하는 사이에 이미 지워졌다면 지운 행이 없다.
      const deleted = await db.query("delete from entries where id = $1 returning id", [id]);
      return deleted.length > 0 ? { ok: true } : { ok: false, reason: "not_found" };
    },
  };
}
