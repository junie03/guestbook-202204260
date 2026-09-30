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

export type Guestbook = {
  /** 규칙을 어기면 아무것도 저장하지 않고 칸별 오류를 돌려준다. */
  create(input: EntryInput): Promise<CreateResult>;
  /** 모든 Entry, 작성 시각 최신순 */
  list(): Promise<Entry[]>;
  /** 글 비밀번호가 맞으면 메시지만 바꾼다. 이름·작성 시각은 그대로다. */
  edit(id: number, input: EditInput): Promise<EditResult>;
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

/** 글자 수는 코드포인트로 센다: 한글·이모지 한 글자가 1자 */
const length = (value: string) => [...value].length;

const within = (value: string, min: number, max: number) => length(value) >= min && length(value) <= max;

const MESSAGES = {
  name: "이름은 1~20자로 입력해 주세요.",
  message: "메시지는 1~500자로 입력해 주세요.",
  password: "비밀번호는 4~30자로 입력해 주세요.",
} as const;

/** 메시지 규칙: 작성과 수정이 함께 쓴다. 앞뒤 공백을 지운 값과, 어겼다면 안내 문구를 돌려준다. */
function checkMessage(raw: string): { message: string; error?: string } {
  const message = raw.trim();
  return within(message, 1, 500) ? { message } : { message, error: MESSAGES.message };
}

/** 이름·메시지는 앞뒤 공백을 지운 뒤 검사하고, 비밀번호는 공백까지 그대로 검사한다. */
function validate(input: EntryInput): { values: EntryInput; errors: FieldErrors } {
  const { message, error: messageError } = checkMessage(input.message);
  const values = { name: input.name.trim(), message, password: input.password };
  const errors: FieldErrors = {};
  if (!within(values.name, 1, 20)) errors.name = MESSAGES.name;
  if (messageError) errors.message = messageError;
  if (!within(values.password, 4, 30)) errors.password = MESSAGES.password;
  return { values, errors };
}

export function createGuestbook(db: Db, clock: { now: () => Date } = { now: () => new Date() }): Guestbook {
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
      const { message, error } = checkMessage(input.message);
      if (error) return { ok: false, reason: "invalid", errors: { message: error } };

      const [found] = await db.query<{ password_hash: string }>("select password_hash from entries where id = $1", [id]);
      if (!found) return { ok: false, reason: "not_found" };
      if (!(await verifyPassword(input.password, found.password_hash))) return { ok: false, reason: "wrong_password" };

      // 비밀번호를 확인하는 사이에 지워졌다면 update가 아무 행도 돌려주지 않는다.
      const [row] = await db.query<Row>(
        `update entries set message = $2, updated_at = $3 where id = $1 returning ${COLUMNS}`,
        [id, message, clock.now()],
      );
      return row ? { ok: true, entry: toEntry(row) } : { ok: false, reason: "not_found" };
    },
  };
}
