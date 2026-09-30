// Neon DB에 db/schema.sql을 적용한다. 여러 번 실행해도 안전하다.
// 사용법: npm run db:setup  (.env.local의 DATABASE_URL을 읽는다)
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL 환경 변수가 없습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
// Neon HTTP 드라이버는 한 번에 한 문장만 실행하므로 세미콜론으로 나눠 차례로 보낸다.
const statements = schema
  .split(";")
  .map((s) => s.replace(/--.*$/gm, "").trim())
  .filter(Boolean);

for (const statement of statements) await sql.query(statement);
console.log(`스키마 적용 완료 (${statements.length}개 문장)`);
