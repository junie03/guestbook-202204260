"use client";

import { startTransition, type FormEvent } from "react";

/**
 * form action을 부르되, 끝난 뒤에도 입력값을 그대로 두는 onSubmit 핸들러.
 *
 * React는 `<form action>`으로 제출한 뒤 입력칸을 초기화한다. 이 앱은 거부되었을 때 입력을 남겨야 하므로
 * 제출을 직접 가로채 startTransition 안에서 action을 부른다. 그 대가로 JS가 로드되기 전에 누른 제출은
 * React가 대기열에 넣어 주지 않고 브라우저 기본 제출이 되어, progressive enhancement를 포기한다.
 */
export function useSubmitKeepingInputs(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}
