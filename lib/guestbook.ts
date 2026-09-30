import type { Db } from "./db";
import { hashPassword } from "./password";

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

export type Guestbook = {
  /** 규칙을 어기면 아무것도 저장하지 않고 칸별 오류를 돌려준다. */
  create(input: EntryInput): Promise<CreateResult>;
  /** 모든 Entry, 작성 시각 최신순 */
  list(): Promise<Entry[]>;
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

/** 이름·메시지는 앞뒤 공백을 지운 뒤 검사하고, 비밀번호는 공백까지 그대로 검사한다. */
function validate(input: EntryInput): { values: EntryInput; errors: FieldErrors } {
  const values = { name: input.name.trim(), message: input.message.trim(), password: input.password };
  const errors: FieldErrors = {};
  if (!within(values.name, 1, 20)) errors.name = MESSAGES.name;
  if (!within(values.message, 1, 500)) errors.message = MESSAGES.message;
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
  };
}
