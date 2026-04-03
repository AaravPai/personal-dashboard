"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addTodo(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const dueAt = formData.get("due_at")?.toString().trim() || null;
  const priority = formData.get("priority")?.toString().trim() || "medium";
  const status = formData.get("status")?.toString().trim() || "todo";
  const category = formData.get("category")?.toString().trim() || null;

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase.from("todos").insert({
    user_id: user.id,
    title,
    description,
    due_at: dueAt || null,
    priority,
    status,
    category,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function deleteTodo(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("Todo id is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function updateTodoStatus(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status) {
    throw new Error("Todo id and status are required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("todos")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/todos");
  revalidatePath("/");
}