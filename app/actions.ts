"use server";

import { revalidatePath } from "next/cache";
import type { FieldErrors } from "@/lib/guestbook";
import { getGuestbook } from "@/lib/server";

export type CreateState = { status: "idle" } | { status: "created" } | { status: "invalid"; errors: FieldErrors };

/** 폼 칸의 값을 문자열로 꺼낸다. 칸이 없으면 빈 문자열이고, 도메인 모듈이 규칙에 따라 거부한다. */
const formField = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function createEntryAction(_prev: CreateState, formData: FormData): Promise<CreateState> {
  const result = await getGuestbook().create({
    name: formField(formData, "name"),
    message: formField(formData, "message"),
    password: formField(formData, "password"),
  });
  if (!result.ok) return { status: "invalid", errors: result.errors };
  revalidatePath("/");
  return { status: "created" };
}

export type EditState =
  | { status: "idle" }
  | { status: "edited" }
  | { status: "invalid"; errors: { message?: string } }
  | { status: "wrong_password" }
  | { status: "not_found" };

export async function editEntryAction(id: number, _prev: EditState, formData: FormData): Promise<EditState> {
  const result = await getGuestbook().edit(id, {
    message: formField(formData, "message"),
    password: formField(formData, "password"),
  });
  if (result.ok) {
    revalidatePath("/");
    return { status: "edited" };
  }
  // not_found일 때는 바로 재검증하지 않는다: 목록이 먼저 새로 고쳐지면 안내를 보여줄 Entry가 사라진다.
  // 화면이 안내를 보여준 뒤 목록을 새로 고친다.
  return result.reason === "invalid" ? { status: "invalid", errors: result.errors } : { status: result.reason };
}

export type DeleteState = { status: "idle" } | { status: "wrong_password" } | { status: "not_found" };

export async function deleteEntryAction(id: number, _prev: DeleteState, formData: FormData): Promise<DeleteState> {
  const result = await getGuestbook().remove(id, formField(formData, "password"));
  if (result.ok) {
    // 재검증된 목록에서 Entry가 사라지므로 따로 돌려줄 상태가 없다.
    revalidatePath("/");
    return { status: "idle" };
  }
  // not_found는 수정과 같은 이유로 바로 재검증하지 않는다.
  return { status: result.reason };
}
