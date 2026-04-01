import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";

export default function Home() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Your central hub for subscriptions, expenses, tasks, and memory."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">
          Welcome
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          This dashboard is designed to grow with you. Start with subscriptions,
          then expand into expenses, tasks, memory, and whatever other systems
          you want to add later.
        </p>
      </div>
    </DashboardShell>
  );
}