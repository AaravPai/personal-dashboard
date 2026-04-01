import { DashboardShell } from "@/components/dashboard-shell";

export default function TodosPage() {
  return (
    <DashboardShell
      title="To-Do"
      description="Manage tasks, deadlines, and priorities."
    >
      <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
        To-do module coming later.
      </div>
    </DashboardShell>
  );
}