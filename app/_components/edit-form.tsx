"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { editEntryAction, type EditState } from "@/app/actions";
import type { Entry } from "@/lib/guestbook";
import { GoneNotice } from "./gone-notice";
import { button, FieldError, input, subtleButton, WRONG_PASSWORD } from "./ui";

/** Entry 안에 펼쳐지는 수정 폼. 열 때마다 새로 마운트되므로 이전 시도의 안내가 남지 않는다. */
export function EditForm({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    editEntryAction.bind(null, entry.id),
    { status: "idle" },
  );
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");

  // 수정에 성공하면 폼을 닫는다. 새 메시지와 "(수정됨)"은 재검증된 목록이 보여준다.
  // 부모 상태를 바꾸는 일이라 렌더링 중이 아니라 effect에서 한다.
  useEffect(() => {
    if (state.status === "edited") onClose();
  }, [state, onClose]);

  if (state.status === "not_found") return <GoneNotice />;

  // React는 form action이 끝나면 입력칸을 초기화하므로, 직접 제출해서 입력값을 유지한다.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="block space-y-1">
        <span className="sr-only">새 메시지</span>
        <textarea
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={input}
          aria-label="새 메시지"
        />
        <FieldError message={state.status === "invalid" ? state.errors.message : undefined} />
      </label>
      <div className="flex items-start gap-2">
        <label className="flex-1 space-y-1">
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="글 비밀번호"
            aria-label="글 비밀번호"
            autoComplete="current-password"
            className={input}
          />
          <FieldError message={state.status === "wrong_password" ? WRONG_PASSWORD : undefined} />
        </label>
        <button type="submit" disabled={pending} className={button}>
          {pending ? "저장 중…" : "저장"}
        </button>
        <button type="button" onClick={onClose} className={`${subtleButton} py-2 text-sm`}>
          취소
        </button>
      </div>
    </form>
  );
}
