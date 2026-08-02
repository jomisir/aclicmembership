import { MEETING_OPTIONS, TIME_COMMITMENT_OPTIONS } from "./form-schema";
import type { ApplicationStatus } from "./types";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  waitlisted: "Waitlisted",
  follow_up: "Follow-up needed",
  rejected: "Not accepted",
};

/** Tailwind classes per status, used for the badge in the admin views. */
export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-slate-100 text-slate-700 ring-slate-300",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  waitlisted: "bg-amber-50 text-amber-800 ring-amber-300",
  follow_up: "bg-sky-50 text-sky-800 ring-sky-300",
  rejected: "bg-rose-50 text-rose-800 ring-rose-300",
};

export function timeCommitmentLabel(value: string): string {
  return TIME_COMMITMENT_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function meetingLabel(value: string): string {
  return MEETING_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
