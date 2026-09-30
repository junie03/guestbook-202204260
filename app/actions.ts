"use server";

import { revalidatePath } from "next/cache";
import type { FieldErrors } from "@/lib/guestbook";
import { getGuestbook } from "@/lib/server";

export type CreateState = { status: "idle" } | { status: "created" } | { status: "invalid"; errors: FieldErrors };

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function createEntryAction(_prev: CreateState, formData: FormData): Promise<CreateState> {
  const result = await getGuestbook().create({
    name: text(formData, "name"),
    message: text(formData, "message"),
    password: text(formData, "password"),
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
    message: text(formData, "message"),
    password: text(formData, "password"),
  });
  if (result.ok) {
    revalidatePath("/");
    return { status: "edited" };
  }
  // not_found일 때는 바로 재검증하지 않는다: 목록이 먼저 새로 고쳐지면 안내를 보여줄 Entry가 사라진다.
  // 화면이 안내를 보여준 뒤 목록을 새로 고친다.
  return result.reason === "invalid" ? { status: "invalid", errors: result.errors } : { status: result.reason };
}
