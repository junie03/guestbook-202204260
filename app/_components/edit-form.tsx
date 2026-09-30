"use client";

import { useActionState, useEffect, useState } from "react";
import { editEntryAction, type EditState } from "@/app/actions";
import type { Entry } from "@/lib/guestbook";
import { GoneNotice } from "./gone-notice";
import { buttonClass, EntryPasswordField, FieldError, inputClass, subtleButtonClass } from "./ui";
import { useSubmitKeepingInputs } from "./use-submit-keeping-inputs";

/** Entry 안에 펼쳐지는 수정 폼. 열 때마다 새로 마운트되므로 이전 시도의 안내가 남지 않는다. */
export function EditForm({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    editEntryAction.bind(null, entry.id),
    { status: "idle" },
  );
  const onSubmit = useSubmitKeepingInputs(formAction);
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");

  // 수정에 성공하면 폼을 닫는다. 새 메시지와 "(수정됨)"은 재검증된 목록이 보여준다.
  // 부모 상태를 바꾸는 일이라 렌더링 중이 아니라 effect에서 한다.
  useEffect(() => {
    if (state.status === "edited") onClose();
  }, [state, onClose]);

  if (state.status === "not_found") return <GoneNotice />;

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="space-y-1">
        <textarea
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
          aria-label="새 메시지"
        />
        <FieldError message={state.status === "invalid" ? state.errors.message : undefined} />
      </div>
      <div className="flex items-start gap-2">
        <EntryPasswordField
          value={password}
          onChange={setPassword}
          label="글 비밀번호"
          wrongPassword={state.status === "wrong_password"}
        />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "저장 중…" : "저장"}
        </button>
        <button type="button" onClick={onClose} className={`${subtleButtonClass} py-2 text-sm`}>
          취소
        </button>
      </div>
    </form>
  );
}
