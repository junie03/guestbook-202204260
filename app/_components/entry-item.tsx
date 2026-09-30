"use client";

import { useCallback, useState } from "react";
import type { Entry } from "@/lib/guestbook";
import { formatKst } from "@/lib/kst";
import { DeleteForm } from "./delete-form";
import { EditForm } from "./edit-form";
import { subtleButtonClass } from "./ui";

type Mode = "view" | "edit" | "delete";

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
          {mode === "delete" ? (
            <DeleteForm entryId={entry.id} onClose={close} />
          ) : (
            <div className="flex justify-end gap-1">
              <button type="button" onClick={() => setMode("edit")} className={subtleButtonClass}>
                수정
              </button>
              <button type="button" onClick={() => setMode("delete")} className={subtleButtonClass}>
                삭제
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}
