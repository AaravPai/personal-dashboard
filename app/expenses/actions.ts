"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addExpense(formData: FormData) {
  const amountValue = formData.get("amount")?.toString().trim();
  const merchant = formData.get("merchant")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || null;
  const purchaseDate = formData.get("purchase_date")?.toString().trim();
  const paymentMethod =
    formData.get("payment_method")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!amountValue || !merchant || !purchaseDate) {
    throw new Error("Amount, merchant, and purchase date are required.");
  }

  const amount = Number(amountValue);

  if (Number.isNaN(amount)) {
    throw new Error("Amount must be a valid number.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount,
    merchant,
    category,
    purchase_date: purchaseDate,
    payment_method: paymentMethod,
    notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("Expense id is required.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/expenses");
  revalidatePath("/");
}