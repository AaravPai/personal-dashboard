import { DashboardShell } from "@/components/dashboard-shell";

export default function MemoryPage() {
  return (
    <DashboardShell
      title="Memory Bank"
      description="Store notes, recipes, recommendations, and useful memories."
    >
      <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
        Memory bank module coming later.
      </div>
    </DashboardShell>
  );
}