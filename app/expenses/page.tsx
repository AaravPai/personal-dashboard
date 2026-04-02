import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { addExpense, deleteExpense } from "./actions";
import { ExpenseFilters } from "./expense-filters";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type SearchParams = Promise<{
  query?: string;
  category?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}>;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    query = "",
    category = "",
    payment_method = "",
    start_date = "",
    end_date = "",
  } = await searchParams;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  const allExpenses = data ?? [];

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();
  const normalizedPaymentMethod = payment_method.trim().toLowerCase();

  const expenses = allExpenses.filter((expense) => {
    const matchesQuery =
      !normalizedQuery ||
      expense.merchant.toLowerCase().includes(normalizedQuery) ||
      expense.notes?.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      !normalizedCategory ||
      expense.category?.toLowerCase() === normalizedCategory;

    const matchesPaymentMethod =
      !normalizedPaymentMethod ||
      expense.payment_method?.toLowerCase() === normalizedPaymentMethod;

    const matchesStartDate =
      !start_date || expense.purchase_date >= start_date;

    const matchesEndDate =
      !end_date || expense.purchase_date <= end_date;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesPaymentMethod &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const categories = Array.from(
    new Set(allExpenses.map((expense) => expense.category).filter(Boolean))
  ).sort() as string[];

  const paymentMethods = Array.from(
    new Set(allExpenses.map((expense) => expense.payment_method).filter(Boolean))
  ).sort() as string[];

  const today = getLocalDateString(new Date());
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthString = getLocalDateString(startOfMonth);

  const todayTotal = expenses.reduce((sum, expense) => {
    return expense.purchase_date === today
      ? sum + (Number(expense.amount) || 0)
      : sum;
  }, 0);

  const monthTotal = expenses.reduce((sum, expense) => {
    return expense.purchase_date >= startOfMonthString
      ? sum + (Number(expense.amount) || 0)
      : sum;
  }, 0);

  const averageExpense =
    expenses.length > 0
      ? expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) /
        expenses.length
      : 0;

  const largestExpense = expenses.reduce<(typeof expenses)[number] | null>(
    (max, current) => {
      if (!max) return current;
      return Number(current.amount) > Number(max.amount) ? current : max;
    },
    null
  );

  return (
    <DashboardShell
      title="Expenses"
      description="Track your daily purchases and spending patterns."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Matching Expenses
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {expenses.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Spent Today</p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(todayTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Spent This Month
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(monthTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-lux-purple/40 bg-lux-purple-soft p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Largest Matching Expense
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {largestExpense
              ? formatCurrency(Number(largestExpense.amount))
              : formatCurrency(0)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {largestExpense ? largestExpense.merchant : "No expenses yet"}
          </p>
        </div>
      </section>

      <ExpenseFilters
        categories={categories}
        paymentMethods={paymentMethods}
      />

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-card-foreground">
          Add Expense
        </h2>

        <form action={addExpense} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="merchant" className="mb-1 block text-sm font-medium">
              Merchant
            </label>
            <input
              id="merchant"
              name="merchant"
              type="text"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="purchase_date"
              className="mb-1 block text-sm font-medium"
            >
              Purchase Date
            </label>
            <input
              id="purchase_date"
              name="purchase_date"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="payment_method"
              className="mb-1 block text-sm font-medium"
            >
              Payment Method
            </label>
            <input
              id="payment_method"
              name="payment_method"
              type="text"
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
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Add Expense
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Error loading expenses: {error.message}
        </div>
      )}

      <section className="grid gap-4">
        {expenses.map((expense) => (
          <article
            key={expense.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {expense.merchant}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {expense.category || "Uncategorized"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {formatCurrency(Number(expense.amount))}
                </div>

                <form action={deleteExpense}>
                  <input type="hidden" name="id" value={expense.id} />
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
                  Purchase Date
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {expense.purchase_date}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Payment Method
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {expense.payment_method || "Not set"}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1 font-semibold text-card-foreground break-words">
                  {expense.notes || "None"}
                </p>
              </div>
            </div>
          </article>
        ))}

        {!error && expenses.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
            No matching expenses.
          </div>
        )}
      </section>
    </DashboardShell>
  );
}