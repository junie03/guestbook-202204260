// 작성 시각은 서버가 어느 시간대에서 돌든 한국 시간(Asia/Seoul, UTC+9, 서머타임 없음)으로 보여준다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Date → "2026-09-30 14:05" (한국 시간) */
export function formatKst(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS).toISOString();
  return `${kst.slice(0, 10)} ${kst.slice(11, 16)}`;
}
