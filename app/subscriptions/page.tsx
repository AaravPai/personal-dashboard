import { createClient } from "@/lib/supabase/server";
import { addSubscription } from "./actions";

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-3xl font-bold">Subscriptions</h1>

      <form action={addSubscription} className="mb-8 space-y-4 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Add Subscription</h2>

        <div>
          <label htmlFor="name" className="mb-1 block font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="cost" className="mb-1 block font-medium">
            Cost
          </label>
          <input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="billing_cycle" className="mb-1 block font-medium">
            Billing Cycle
          </label>
          <select
            id="billing_cycle"
            name="billing_cycle"
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select one</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block font-medium">
            Category
          </label>
          <input
            id="category"
            name="category"
            type="text"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="next_billing_date" className="mb-1 block font-medium">
            Next Billing Date
          </label>
          <input
            id="next_billing_date"
            name="next_billing_date"
            type="date"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add Subscription
        </button>
      </form>

      {error && <p className="mb-4 text-red-600">Error: {error.message}</p>}

      {!error && (!data || data.length === 0) && <p>No subscriptions yet.</p>}

      <div className="space-y-4">
        {data?.map((sub) => (
          <div key={sub.id} className="rounded-lg border p-4">
            <h2 className="text-xl font-semibold">{sub.name}</h2>
            <p>Cost: ${sub.cost}</p>
            <p>Billing cycle: {sub.billing_cycle}</p>
            {sub.category && <p>Category: {sub.category}</p>}
            {sub.next_billing_date && (
              <p>Next billing date: {sub.next_billing_date}</p>
            )}
            {sub.notes && <p>Notes: {sub.notes}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}