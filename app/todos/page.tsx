import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { addTodo, deleteTodo, updateTodoStatus } from "./actions";
import { TodoFilters } from "./todo-filters";
import {
  formatLocalTimestamp,
  isOverdueInAppTimeZone,
} from "@/lib/datetime";
import { redirect } from "next/navigation";

function formatStatusLabel(status: string) {
  if (status === "todo") return "To Do";
  if (status === "in_progress") return "In Progress";
  if (status === "done") return "Done";
  return status;
}

function getPriorityClasses(priority: string) {
  if (priority === "high") {
    return "border-lux-gold/40 bg-lux-gold-soft text-foreground";
  }

  if (priority === "medium") {
    return "border-lux-purple/40 bg-lux-purple-soft text-foreground";
  }

  return "border-border bg-secondary text-secondary-foreground";
}

type SearchParams = Promise<{
  query?: string;
  status?: string;
  priority?: string;
  category?: string;
  overdue?: string;
}>;

export default async function TodosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    query = "",
    status = "",
    priority = "",
    category = "",
    overdue = "",
  } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allTodos = data ?? [];

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedStatus = status.trim().toLowerCase();
  const normalizedPriority = priority.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();

  const todos = allTodos.filter((todo) => {
    const matchesQuery =
      !normalizedQuery ||
      todo.title.toLowerCase().includes(normalizedQuery) ||
      todo.description?.toLowerCase().includes(normalizedQuery);

    const matchesStatus =
      !normalizedStatus || todo.status.toLowerCase() === normalizedStatus;

    const matchesPriority =
      !normalizedPriority || todo.priority.toLowerCase() === normalizedPriority;

    const matchesCategory =
      !normalizedCategory ||
      todo.category?.toLowerCase() === normalizedCategory;

    const taskIsOverdue =
      todo.status !== "done" && isOverdueInAppTimeZone(todo.due_at);

    const matchesOverdue =
      overdue === ""
        ? true
        : overdue === "true"
        ? taskIsOverdue
        : !taskIsOverdue;

    return (
      matchesQuery &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesOverdue
    );
  });

  const categories = Array.from(
    new Set(allTodos.map((todo) => todo.category).filter(Boolean))
  ).sort() as string[];

  const todoCount = todos.filter((item) => item.status === "todo").length;
  const inProgressCount = todos.filter(
    (item) => item.status === "in_progress"
  ).length;
  const doneCount = todos.filter((item) => item.status === "done").length;
  const overdueCount = todos.filter(
    (item) => item.status !== "done" && isOverdueInAppTimeZone(item.due_at)
  ).length;

  return (
    <DashboardShell
      title="To-Do"
      description="Manage tasks, deadlines, and priorities."
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Matching Tasks
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {todos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            In Progress
          </p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {inProgressCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Done</p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {doneCount}
          </p>
        </div>

        <div className="rounded-2xl border border-lux-gold/40 bg-lux-gold-soft p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Overdue</p>
          <p className="mt-2 text-2xl font-bold text-card-foreground">
            {overdueCount}
          </p>
        </div>
      </section>

      <TodoFilters categories={categories} />

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-card-foreground">
          Add Task
        </h2>

        <form action={addTodo} className="grid gap-4 md:grid-cols-2">
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

          <div>
            <label htmlFor="due_at" className="mb-1 block text-sm font-medium">
              Due Date & Time
            </label>
            <input
              id="due_at"
              name="due_at"
              type="datetime-local"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-1 block text-sm font-medium"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="medium"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="todo"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Add Task
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Error loading tasks: {error.message}
        </div>
      )}

      <section className="grid gap-4">
        {todos.map((todo) => (
          <article
            key={todo.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {todo.title}
                  </h2>

                  <div
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClasses(
                      todo.priority
                    )}`}
                  >
                    {todo.priority}
                  </div>

                  <div className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {formatStatusLabel(todo.status)}
                  </div>

                  {todo.status !== "done" && isOverdueInAppTimeZone(todo.due_at) && (
                    <div className="inline-flex rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                      Overdue
                    </div>
                  )}
                </div>

                {todo.category && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {todo.category}
                  </p>
                )}

                {todo.description && (
                  <p className="mt-3 break-words text-sm text-card-foreground">
                    {todo.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <form action={updateTodoStatus}>
                  <input type="hidden" name="id" value={todo.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={
                      todo.status === "todo"
                        ? "in_progress"
                        : todo.status === "in_progress"
                        ? "done"
                        : "todo"
                    }
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                  >
                    {todo.status === "todo"
                      ? "Start"
                      : todo.status === "in_progress"
                      ? "Mark Done"
                      : "Reset"}
                  </button>
                </form>

                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-xl border border-destructive/30 bg-destructive/10 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/15"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Due
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {formatLocalTimestamp(todo.due_at)}
                </p>
              </div>

              <div className="rounded-xl bg-muted px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 font-semibold text-card-foreground">
                  {new Date(todo.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </article>
        ))}

        {!error && todos.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
            No matching tasks.
          </div>
        )}
      </section>
    </DashboardShell>
  );
}