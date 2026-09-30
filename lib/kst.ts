// 작성 시각은 서버가 어느 시간대에서 돌든 한국 시간(Asia/Seoul)으로 보여준다.
// 클라이언트 컴포넌트에서도 쓰므로 node 모듈에 의존하지 않는다.
const parts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Date → "2026-09-30 14:05" (한국 시간) */
export function formatKst(date: Date): string {
  const p = Object.fromEntries(parts.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}
