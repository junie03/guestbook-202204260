import { neon } from "@neondatabase/serverless";

/**
 * 도메인 모듈이 의존하는 최소한의 SQL 실행 인터페이스.
 * 운영에서는 Neon, 테스트에서는 PGlite 구현을 주입한다.
 */
export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}

export function neonDb(url: string): Db {
  const sql = neon(url);
  return {
    async query<T>(text: string, params: unknown[] = []) {
      return (await sql.query(text, params)) as T[];
    },
  };
}
