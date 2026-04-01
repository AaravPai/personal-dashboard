"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addSubscription(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const costValue = formData.get("cost")?.toString().trim();
  const billingCycle = formData.get("billing_cycle")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || null;
  const nextBillingDate =
    formData.get("next_billing_date")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!name || !costValue || !billingCycle) {
    throw new Error("Name, cost, and billing cycle are required.");
  }

  const cost = Number(costValue);

  if (Number.isNaN(cost)) {
    throw new Error("Cost must be a valid number.");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("subscriptions").insert({
    name,
    cost,
    billing_cycle: billingCycle,
    category,
    next_billing_date: nextBillingDate || null,
    notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/subscriptions");
}