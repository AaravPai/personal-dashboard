"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems } from "@/lib/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm lg:w-72">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
          Personal Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize the systems in your life.
        </p>
      </div>

      <nav className="space-y-2">
        {dashboardNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-card-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}