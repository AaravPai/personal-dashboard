import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { addSubscription, deleteSubscription } from "./actions";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  const subscriptions = data ?? [];

  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    const cost = Number(sub.cost) || 0;
    if (sub.billing_cycle === "monthly") return sum + cost;
    if (sub.billing_cycle === "yearly") return sum + cost / 12;
    return sum;
  }, 0);

  const yearlyTotal = subscriptions.reduce((sum, sub) => {
    const cost = Number(sub.cost) || 0;
    if (sub.billing_cycle === "monthly") return sum + cost * 12;
    if (sub.billing_cycle === "yearly") return sum + cost;
    return sum;
  }, 0);

  const activeCount = subscriptions.length;

  const mostExpensive = subscriptions.reduce<
    (typeof subscriptions)[number] | null
  >((max, current) => {
    if (!max) return current;
    return Number(current.cost) > Number(max.cost) ? current : max;
  }, null);

  return (
    <DashboardShell
      title="Subscriptions"
      description="Track recurring services, categories, and billing dates."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Estimated Monthly Total
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(monthlyTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Estimated Yearly Total
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(yearlyTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Total Subscriptions
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Highest Listed Cost
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {mostExpensive
              ? formatCurrency(Number(mostExpensive.cost))
              : formatCurrency(0)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mostExpensive ? mostExpensive.name : "No subscriptions yet"}
          </p>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-card-foreground">
          Add Subscription
        </h2>

        <form action={addSubscription} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="cost" className="mb-1 block text-sm font-medium">
              Cost
            </label>
            <input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="billing_cycle"
              className="mb-1 block text-sm font-medium"
            >
              Billing Cycle
            </label>
            <select
              id="billing_cycle"
              name="billing_cycle"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select one</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium"
            >
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="next_billing_date"
              className="mb-1 block text-sm font-medium"
            >
              Next Billing Date
            </label>
            <input
              id="next_billing_date"
              name="next_billing_date"
              type="date"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={1}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Add Subscription
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Error loading subscriptions: {error.message}
        </div>
      )}

      <section className="grid gap-4">
        {subscriptions.map((sub) => (
          <article
            key={sub.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {sub.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sub.category || "Uncategorized"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {sub.billing_cycle}
                </div>

                <form action={deleteSubscription}>
                  <input type="hidden" name="id" value={sub.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-xl border border-destructive/30 bg-destructive/10 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/15"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Cost
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {formatCurrency(Number(sub.cost))}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next Billing
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {sub.next_billing_date || "Not set"}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 font-semibold text-card-foreground break-words">
                  {sub.notes || "None"}
                </p>
              </div>
            </div>
          </article>
        ))}

        {!error && subscriptions.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
            No subscriptions yet.
          </div>
        )}
      </section>
    </DashboardShell>
  );
}