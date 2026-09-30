"use client";

import { useCallback, useState } from "react";
import type { Entry } from "@/lib/guestbook";
import { formatKst } from "@/lib/kst";
import { EditForm } from "./edit-form";
import { subtleButton } from "./ui";

type Mode = "view" | "edit";

export function EntryItem({ entry }: { entry: Entry }) {
  const [mode, setMode] = useState<Mode>("view");
  const close = useCallback(() => setMode("view"), []);

  return (
    <li className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{entry.name}</span>
        <span className="text-xs text-zinc-500">
          {formatKst(entry.createdAt)}
          {entry.edited && " (수정됨)"}
        </span>
      </div>
      {mode === "edit" ? (
        <EditForm entry={entry} onClose={close} />
      ) : (
        <>
          <p className="whitespace-pre-wrap break-words text-sm">{entry.message}</p>
          <div className="flex justify-end gap-1">
            <button type="button" onClick={() => setMode("edit")} className={subtleButton}>
              수정
            </button>
          </div>
        </>
      )}
    </li>
  );
}
