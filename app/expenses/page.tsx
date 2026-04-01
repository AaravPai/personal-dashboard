import { DashboardShell } from "@/components/dashboard-shell";

export default function ExpensesPage() {
  return (
    <DashboardShell
      title="Expenses"
      description="Track your daily purchases and spending patterns."
    >
      <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
        Expenses module coming next.
      </div>
    </DashboardShell>
  );
}