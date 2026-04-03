import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { LogoutButton } from "@/components/logout-button";

type DashboardShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-card/85 px-5 py-4 shadow-sm backdrop-blur">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <DashboardSidebar />
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </main>
  );
}