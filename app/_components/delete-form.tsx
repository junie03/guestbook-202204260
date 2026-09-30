"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { deleteEntryAction, type DeleteState } from "@/app/actions";
import { GoneNotice } from "./gone-notice";
import { FieldError, input, subtleButton, WRONG_PASSWORD } from "./ui";

const dangerButton =
  "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50";

/** Entry 안에 펼쳐지는 삭제 폼. 글 비밀번호 입력이 곧 삭제 확인이다. */
export function DeleteForm({ entryId, onClose }: { entryId: number; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(
    deleteEntryAction.bind(null, entryId),
    { status: "idle" },
  );
  const [password, setPassword] = useState("");

  if (state.status === "not_found") return <GoneNotice />;

  // React는 form action이 끝나면 입력칸을 초기화하므로, 직접 제출해서 입력값을 유지한다.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={onSubmit} className="flex items-start gap-2">
      <label className="flex-1 space-y-1">
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="글 비밀번호"
          aria-label="삭제할 글의 비밀번호"
          autoComplete="current-password"
          className={input}
        />
        <FieldError message={state.status === "wrong_password" ? WRONG_PASSWORD : undefined} />
      </label>
      <button type="submit" disabled={pending} className={dangerButton}>
        {pending ? "삭제 중…" : "삭제 확인"}
      </button>
      <button type="button" onClick={onClose} className={`${subtleButton} py-2 text-sm`}>
        취소
      </button>
    </form>
  );
}
