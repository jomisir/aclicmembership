import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminContext } from "@/lib/auth";
import { formatDateTime, STATUS_LABELS } from "@/lib/labels";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApplicationStatus, ApplicationSummary } from "@/lib/types";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

const SUMMARY_COLUMNS =
  "id, created_at, reference_code, structure_name, lead_child_full_name, age, gender, woreda_subcity_city, members_total, phone, email, status";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "approved", label: STATUS_LABELS.approved },
  { value: "waitlisted", label: STATUS_LABELS.waitlisted },
  { value: "follow_up", label: STATUS_LABELS.follow_up },
  { value: "rejected", label: STATUS_LABELS.rejected },
];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const context = await requireAdminContext();

  if (!context.admin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-bold text-ink-900">This account cannot review applications</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          You are signed in as <strong>{context.email}</strong>, but that account is not on the
          reviewer allowlist. An existing administrator needs to add it to the{" "}
          <code className="rounded bg-ink-100 px-1">admins</code> table in Supabase.
        </p>
        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="rounded-lg border border-ink-300 bg-white px-5 py-2.5 text-[15px] font-semibold text-ink-800 hover:bg-ink-50"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  const { status = "all", q = "" } = await searchParams;

  // A coalition-sized dataset: fetch once, then tally and filter in memory
  // so the status counts and the search stay consistent with each other.
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-bold text-ink-900">Could not load applications</h1>
        <p className="mt-3 text-[15px] text-ink-600">
          Supabase returned an error. Check that the schema in{" "}
          <code className="rounded bg-ink-100 px-1">supabase/schema.sql</code> has been applied.
        </p>
      </div>
    );
  }

  const all = (data ?? []) as unknown as ApplicationSummary[];

  const counts = all.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      acc.all += 1;
      return acc;
    },
    { all: 0 },
  );

  const needle = q.trim().toLowerCase();
  const rows = all.filter((row) => {
    if (status !== "all" && row.status !== status) return false;
    if (!needle) return true;
    return [
      row.reference_code,
      row.structure_name,
      row.lead_child_full_name,
      row.woreda_subcity_city,
      row.phone,
      row.email ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Applications</h1>
          <p className="mt-1 text-sm text-ink-500">
            {counts.all} received · {counts.pending ?? 0} awaiting review
          </p>
        </div>
        <a
          href="/api/admin/export"
          className="rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition hover:bg-ink-100"
        >
          Export all as CSV
        </a>
      </div>

      {/* Filters + search */}
      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          const params = new URLSearchParams();
          if (filter.value !== "all") params.set("status", filter.value);
          if (q) params.set("q", q);
          const href = params.toString() ? `/admin?${params}` : "/admin";
          return (
            <Link
              key={filter.value}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-ink-900 text-gold-300"
                  : "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100"
              }`}
            >
              {filter.label}
              <span className={`ml-1.5 ${active ? "text-ink-400" : "text-ink-400"}`}>
                {filter.value === "all" ? counts.all : (counts[filter.value] ?? 0)}
              </span>
            </Link>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, reference, phone…"
            className="w-56 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm shadow-xs"
          />
          <button
            type="submit"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {rows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center text-ink-500">
          {counts.all === 0
            ? "No applications have been submitted yet."
            : "No applications match this filter."}
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-ink-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Structure</th>
                  <th className="px-4 py-3 font-semibold">Child leading</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-gold-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/${row.id}`}
                        className="font-mono text-xs font-semibold text-ink-900 underline-offset-2 hover:underline"
                      >
                        {row.reference_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-800">{row.structure_name}</td>
                    <td className="px-4 py-3 text-ink-800">
                      {row.lead_child_full_name}
                      <span className="ml-1.5 text-ink-400">({row.age})</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{row.woreda_subcity_city}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-600">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status as ApplicationStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-6 grid gap-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/${row.id}`}
                  className="block rounded-xl border border-ink-200 bg-white p-4 transition hover:border-ink-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs font-semibold text-ink-500">
                      {row.reference_code}
                    </span>
                    <StatusBadge status={row.status as ApplicationStatus} />
                  </div>
                  <p className="mt-2 font-semibold text-ink-900">{row.structure_name}</p>
                  <p className="text-sm text-ink-600">
                    {row.lead_child_full_name} · {row.age} · {row.woreda_subcity_city}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{formatDateTime(row.created_at)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
