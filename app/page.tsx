import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import {
  formatLocalTimestamp,
  getCurrentDateInAppTimeZone,
  isOverdueInAppTimeZone,
} from "@/lib/datetime";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatStatusLabel(status: string) {
  if (status === "todo") return "To Do";
  if (status === "in_progress") return "In Progress";
  if (status === "done") return "Done";
  return status;
}

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: subscriptionsData },
    { data: expensesData },
    { data: todosData },
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("*")
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const subscriptions = subscriptionsData ?? [];
  const expenses = expensesData ?? [];
  const todos = todosData ?? [];

  const monthlySubscriptionTotal = subscriptions.reduce((sum, sub) => {
    const cost = Number(sub.cost) || 0;
    if (sub.billing_cycle === "monthly") return sum + cost;
    if (sub.billing_cycle === "yearly") return sum + cost / 12;
    return sum;
  }, 0);

  const today = getCurrentDateInAppTimeZone();
  const startOfMonthString = `${today.slice(0, 8)}01`;

  const todaySpend = expenses.reduce((sum, expense) => {
    return expense.purchase_date === today
      ? sum + (Number(expense.amount) || 0)
      : sum;
  }, 0);

  const monthSpend = expenses.reduce((sum, expense) => {
    return expense.purchase_date >= startOfMonthString
      ? sum + (Number(expense.amount) || 0)
      : sum;
  }, 0);

  const totalMonthlySpending = monthlySubscriptionTotal + monthSpend;

  const openTasks = todos.filter((todo) => todo.status !== "done").length;
  const overdueTasks = todos.filter(
    (todo) => todo.status !== "done" && isOverdueInAppTimeZone(todo.due_at)
  ).length;

  const recentSubscriptions = subscriptions.slice(0, 3);
  const recentExpenses = expenses.slice(0, 5);
  const recentTasks = todos.slice(0, 5);

  return (
    <DashboardShell
      title="Dashboard"
      description="Your central hub for subscriptions, expenses, tasks, and memory."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Monthly Subscription Total
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(monthlySubscriptionTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Spending Today
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(todaySpend)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Spending This Month
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {formatCurrency(monthSpend)}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-lux-purple/40 bg-gradient-to-br from-lux-purple-soft via-card to-lux-gold-soft p-5 shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lux-purple via-lux-gold to-lux-silver" />
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-lux-purple/20 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-lux-gold/20 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-medium text-muted-foreground">
              Total Monthly Spending
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(totalMonthlySpending)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Expenses + monthly subscription load
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Open Tasks
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {openTasks}
          </p>
        </div>

        <div className="rounded-2xl border border-lux-gold/40 bg-lux-gold-soft p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Overdue Tasks
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {overdueTasks}
          </p>
        </div>
      </section>

      <section className="mb-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-card-foreground">
              Recent Subscriptions
            </h2>
            <Link
              href="/subscriptions"
              className="text-sm font-medium text-primary transition hover:opacity-80"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentSubscriptions.length > 0 ? (
              recentSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">
                      {sub.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sub.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="ml-4 text-right">
                    <p className="font-semibold text-card-foreground">
                      {formatCurrency(Number(sub.cost))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sub.billing_cycle}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No subscriptions yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-card-foreground">
              Recent Expenses
            </h2>
            <Link
              href="/expenses"
              className="text-sm font-medium text-primary transition hover:opacity-80"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">
                      {expense.merchant}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category || "Uncategorized"}
                    </p>
                  </div>

                  <div className="ml-4 text-right">
                    <p className="font-semibold text-card-foreground">
                      {formatCurrency(Number(expense.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {expense.purchase_date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No expenses yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-card-foreground">
              Recent Tasks
            </h2>
            <Link
              href="/todos"
              className="text-sm font-medium text-primary transition hover:opacity-80"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((todo) => (
                <div key={todo.id} className="rounded-xl bg-muted px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-card-foreground">
                        {todo.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatStatusLabel(todo.status)}
                      </p>
                    </div>

                    {todo.status !== "done" && isOverdueInAppTimeZone(todo.due_at) ? (
                      <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        Overdue
                      </span>
                    ) : (
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {todo.priority}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatLocalTimestamp(todo.due_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/subscriptions"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <p className="text-sm font-medium text-muted-foreground">Module</p>
          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            Subscriptions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track recurring spending and renewal dates.
          </p>
        </Link>

        <Link
          href="/expenses"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <p className="text-sm font-medium text-muted-foreground">Module</p>
          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            Expenses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log purchases and monitor day-to-day spending.
          </p>
        </Link>

        <Link
          href="/todos"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <p className="text-sm font-medium text-muted-foreground">Module</p>
          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            To-Do
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep track of tasks, deadlines, and priorities.
          </p>
        </Link>

        <Link
          href="/memory"
          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <p className="text-sm font-medium text-muted-foreground">Module</p>
          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            Memory Bank
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save useful notes, recipes, ideas, and things worth remembering.
          </p>
        </Link>
      </section>
    </DashboardShell>
  );
}