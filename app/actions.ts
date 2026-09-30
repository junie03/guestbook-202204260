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
