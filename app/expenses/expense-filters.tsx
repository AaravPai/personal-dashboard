"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ExpenseFiltersProps = {
  categories: string[];
  paymentMethods: string[];
};

export function ExpenseFilters({
  categories,
  paymentMethods,
}: ExpenseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") ?? "";
  const category = searchParams.get("category") ?? "";
  const paymentMethod = searchParams.get("payment_method") ?? "";
  const startDate = searchParams.get("start_date") ?? "";
  const endDate = searchParams.get("end_date") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.replace(pathname);
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">
          Search & Filter
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-card-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          Clear
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label htmlFor="query" className="mb-1 block text-sm font-medium">
            Search
          </label>
          <input
            id="query"
            type="text"
            defaultValue={query}
            placeholder="Merchant or notes"
            onChange={(e) => updateParam("query", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="category-filter" className="mb-1 block text-sm font-medium">
            Category
          </label>
          <select
            id="category-filter"
            defaultValue={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="payment-method-filter"
            className="mb-1 block text-sm font-medium"
          >
            Payment Method
          </label>
          <select
            id="payment-method-filter"
            defaultValue={paymentMethod}
            onChange={(e) => updateParam("payment_method", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All methods</option>
            {paymentMethods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start-date" className="mb-1 block text-sm font-medium">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            defaultValue={startDate}
            onChange={(e) => updateParam("start_date", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="end-date" className="mb-1 block text-sm font-medium">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            defaultValue={endDate}
            onChange={(e) => updateParam("end_date", e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </section>
  );
}