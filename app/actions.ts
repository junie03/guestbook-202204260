"use server";

import { revalidatePath } from "next/cache";
import { getGuestbook } from "@/lib/server";

export type CreateState = { status: "idle" } | { status: "created" };

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function createEntryAction(_prev: CreateState, formData: FormData): Promise<CreateState> {
  await getGuestbook().create({
    name: text(formData, "name"),
    message: text(formData, "message"),
    password: text(formData, "password"),
  });
  revalidatePath("/");
  return { status: "created" };
}
