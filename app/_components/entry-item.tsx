import type { Entry } from "@/lib/guestbook";
import { formatKst } from "@/lib/kst";

export function EntryItem({ entry }: { entry: Entry }) {
  return (
    <li className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{entry.name}</span>
        <span className="text-xs text-zinc-500">
          {formatKst(entry.createdAt)}
          {entry.edited && " (수정됨)"}
        </span>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm">{entry.message}</p>
    </li>
  );
}
