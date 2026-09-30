import { connection } from "next/server";
import { getGuestbook } from "@/lib/server";
import { EntryForm } from "./_components/entry-form";
import { EntryItem } from "./_components/entry-item";

export default async function Home() {
  // 목록은 요청마다 DB에서 읽는다. 빌드 때 미리 그려 두지 않는다.
  await connection();
  const entries = await getGuestbook().list();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">방명록</h1>
      <EntryForm />
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500">글 {entries.length}개</h2>
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            아직 남겨진 글이 없습니다. 첫 글을 남겨 주세요!
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
