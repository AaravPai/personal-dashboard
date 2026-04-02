"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addMemoryEntry(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || null;
  const tags = formData.get("tags")?.toString().trim() || null;
  const isPinned = formData.get("is_pinned") === "on";

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("memory_entries").insert({
    title,
    content,
    category,
    tags,
    is_pinned: isPinned,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/memory");
  revalidatePath("/");
}

export async function deleteMemoryEntry(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("Memory entry id is required.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("memory_entries")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/memory");
  revalidatePath("/");
}

export async function togglePinnedMemoryEntry(formData: FormData) {
  const id = formData.get("id")?.toString();
  const currentPinnedValue = formData.get("current_pinned")?.toString();

  if (!id) {
    throw new Error("Memory entry id is required.");
  }

  const nextPinnedValue = currentPinnedValue !== "true";

  const supabase = await createClient();

  const { error } = await supabase
    .from("memory_entries")
    .update({ is_pinned: nextPinnedValue })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/memory");
  revalidatePath("/");
}