"use client";

import { useActionState, useState } from "react";
import { deleteEntryAction, type DeleteState } from "@/app/actions";
import { GoneNotice } from "./gone-notice";
import { dangerButtonClass, EntryPasswordField, subtleButtonClass } from "./ui";
import { useSubmitKeepingInputs } from "./use-submit-keeping-inputs";

/** Entry 안에 펼쳐지는 삭제 폼. 글 비밀번호 입력이 곧 삭제 확인이다. */
export function DeleteForm({ entryId, onClose }: { entryId: number; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(
    deleteEntryAction.bind(null, entryId),
    { status: "idle" },
  );
  const onSubmit = useSubmitKeepingInputs(formAction);
  const [password, setPassword] = useState("");

  if (state.status === "not_found") return <GoneNotice />;

  return (
    <form onSubmit={onSubmit} className="flex items-start gap-2">
      <EntryPasswordField
        value={password}
        onChange={setPassword}
        label="삭제할 글의 비밀번호"
        wrongPassword={state.status === "wrong_password"}
      />
      <button type="submit" disabled={pending} className={dangerButtonClass}>
        {pending ? "삭제 중…" : "삭제 확인"}
      </button>
      <button type="button" onClick={onClose} className={`${subtleButtonClass} py-2 text-sm`}>
        취소
      </button>
    </form>
  );
}
