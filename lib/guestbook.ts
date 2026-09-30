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

export type Guestbook = {
  create(input: EntryInput): Promise<Entry>;
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

export function createGuestbook(db: Db, clock: { now: () => Date } = { now: () => new Date() }): Guestbook {
  return {
    async create({ name, message, password }) {
      const [row] = await db.query<Row>(
        `insert into entries (name, message, password_hash, created_at)
         values ($1, $2, $3, $4)
         returning ${COLUMNS}`,
        [name, message, await hashPassword(password), clock.now()],
      );
      return toEntry(row);
    },

    async list() {
      const rows = await db.query<Row>(`select ${COLUMNS} from entries order by created_at desc, id desc`);
      return rows.map(toEntry);
    },
  };
}
