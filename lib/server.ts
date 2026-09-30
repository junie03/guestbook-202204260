import { neonDb } from "./db";
import { createGuestbook, type Guestbook } from "./guestbook";

let guestbook: Guestbook | undefined;

/** 운영용 방명록 도메인 모듈 (Neon). */
export function getGuestbook(): Guestbook {
  if (!guestbook) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
    guestbook = createGuestbook(neonDb(url));
  }
  return guestbook;
}
