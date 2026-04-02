import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import {
  addMemoryEntry,
  deleteMemoryEntry,
  togglePinnedMemoryEntry,
} from "./actions";

function getTagList(tags: string | null) {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default async function MemoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memory_entries")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const entries = data ?? [];

  const pinnedCount = entries.filter((entry) => entry.is_pinned).length;
  const recipeCount = entries.filter(
    (entry) => entry.category?.toLowerCase() === "recipe"
  ).length;
  const categoryCount = new Set(
    entries.map((entry) => entry.category).filter(Boolean)
  ).size;
  const totalEntries = entries.length;

  return (
    <DashboardShell
      title="Memory Bank"
      description="Store notes, recipes, recommendations, and useful memories."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Total Entries
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {totalEntries}
          </p>
        </div>

        <div className="rounded-2xl border border-lux-purple/40 bg-lux-purple-soft p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Pinned</p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {pinnedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Recipes</p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {recipeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Categories
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {categoryCount}
          </p>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-card-foreground">
          Add Memory Entry
        </h2>

        <form action={addMemoryEntry} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
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

          <div className="md:col-span-2">
            <label htmlFor="tags" className="mb-1 block text-sm font-medium">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="recipe, dinner, high-protein"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="content" className="mb-1 block text-sm font-medium">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={5}
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input
              id="is_pinned"
              name="is_pinned"
              type="checkbox"
              className="h-4 w-4 rounded border border-input"
            />
            <label htmlFor="is_pinned" className="text-sm font-medium">
              Pin this entry
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Add Memory
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Error loading memory entries: {error.message}
        </div>
      )}

      <section className="grid gap-4">
        {entries.map((entry) => {
          const tagList = getTagList(entry.tags);

          return (
            <article
              key={entry.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-card-foreground">
                      {entry.title}
                    </h2>

                    {entry.is_pinned && (
                      <div className="inline-flex rounded-full border border-lux-purple/40 bg-lux-purple-soft px-3 py-1 text-xs font-medium text-foreground">
                        Pinned
                      </div>
                    )}

                    {entry.category && (
                      <div className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {entry.category}
                      </div>
                    )}
                  </div>

                  <p className="mt-3 break-words whitespace-pre-wrap text-sm text-card-foreground">
                    {entry.content}
                  </p>

                  {tagList.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tagList.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={togglePinnedMemoryEntry}>
                    <input type="hidden" name="id" value={entry.id} />
                    <input
                      type="hidden"
                      name="current_pinned"
                      value={String(entry.is_pinned)}
                    />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                    >
                      {entry.is_pinned ? "Unpin" : "Pin"}
                    </button>
                  </form>

                  <form action={deleteMemoryEntry}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center rounded-xl border border-destructive/30 bg-destructive/10 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/15"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-muted px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
            </article>
          );
        })}

        {!error && entries.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
            No memory entries yet.
          </div>
        )}
      </section>
    </DashboardShell>
  );
}