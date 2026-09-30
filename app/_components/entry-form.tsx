"use client";

import { useActionState, useState } from "react";
import { createEntryAction, type CreateState } from "@/app/actions";
import { buttonClass, FieldError, inputClass } from "./ui";
import { useSubmitKeepingInputs } from "./use-submit-keeping-inputs";

export function EntryForm() {
  const [state, formAction, pending] = useActionState<CreateState, FormData>(createEntryAction, { status: "idle" });
  const onSubmit = useSubmitKeepingInputs(formAction);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  // 작성에 성공하면 메시지·글 비밀번호만 비운다. 이름은 다음 글을 위해 남긴다.
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.status === "created") {
      setMessage("");
      setPassword("");
    }
  }

  const errors = state.status === "invalid" ? state.errors : {};

  // 안내 문구(FieldError)는 label 밖에 둔다: label 안에 있으면 칸의 접근성 이름에 섞여 화면 낭독기가 함께 읽는다.
  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="space-y-1">
        <label className="block space-y-1">
          <span className="text-sm font-medium">이름</span>
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <FieldError message={errors.name} />
      </div>
      <div className="space-y-1">
        <label className="block space-y-1">
          <span className="text-sm font-medium">메시지</span>
          <textarea
            name="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={inputClass}
          />
        </label>
        <FieldError message={errors.message} />
      </div>
      <div className="space-y-1">
        <label className="block space-y-1">
          <span className="text-sm font-medium">글 비밀번호</span>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </label>
        <FieldError message={errors.password} />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "남기는 중…" : "글 남기기"}
        </button>
      </div>
    </form>
  );
}
