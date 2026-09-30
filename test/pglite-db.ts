import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "@/lib/db";

const schema = readFileSync(join(__dirname, "..", "db", "schema.sql"), "utf8");

export type TestDb = Db & {
  /** 모든 Entry를 지워 테스트끼리 독립적으로 만든다. */
  reset(): Promise<void>;
};

/** 운영과 같은 스키마를 적용한 인메모리 Postgres. 띄우는 비용이 커서 파일당 하나를 만들고 테스트마다 reset한다. */
export async function createTestDb(): Promise<TestDb> {
  const pg = new PGlite();
  await pg.exec(schema);
  return {
    async query<T>(text: string, params: unknown[] = []) {
      return (await pg.query<T>(text, params)).rows;
    },
    async reset() {
      await pg.exec("truncate entries restart identity");
    },
  };
}
