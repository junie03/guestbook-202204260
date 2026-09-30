"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { createEntryAction, type CreateState } from "@/app/actions";
import { button, FieldError, input } from "./ui";

export function EntryForm() {
  const [state, formAction, pending] = useActionState<CreateState, FormData>(createEntryAction, { status: "idle" });
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  // 작성에 성공하면 메시지·비밀번호만 비운다. 이름은 다음 글을 위해 남긴다.
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "created") {
      setMessage("");
      setPassword("");
    }
  }

  const errors = state.status === "invalid" ? state.errors : {};

  // React는 form action이 끝나면 입력칸을 초기화하므로, 직접 제출해서 입력값을 우리가 관리한다.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start gap-3">
        <label className="flex-1 space-y-1">
          <span className="text-sm font-medium">이름</span>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
          <FieldError message={errors.name} />
        </label>
        <label className="flex-1 space-y-1">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
            autoComplete="new-password"
          />
          <FieldError message={errors.password} />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium">메시지</span>
        <textarea
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={input}
        />
        <FieldError message={errors.message} />
      </label>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={button}>
          {pending ? "남기는 중…" : "글 남기기"}
        </button>
      </div>
    </form>
  );
}
