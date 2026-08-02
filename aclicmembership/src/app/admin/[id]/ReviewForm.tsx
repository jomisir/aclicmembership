"use client";

import { useActionState } from "react";
import { STATUS_LABELS } from "@/lib/labels";
import type { ApplicationStatus } from "@/lib/types";
import { updateReviewAction, type ReviewState } from "../actions";

const STATUS_ORDER: ApplicationStatus[] = [
  "pending",
  "approved",
  "waitlisted",
  "follow_up",
  "rejected",
];

interface ReviewFormProps {
  id: string;
  status: ApplicationStatus;
  notes: string;
}

export function ReviewForm({ id, status, notes }: ReviewFormProps) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(updateReviewAction, {});

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={id} />

      <fieldset>
        <legend className="text-sm font-semibold text-ink-800">Decision</legend>
        <div className="mt-2 grid gap-2">
          {STATUS_ORDER.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 transition has-checked:border-gold-500 has-checked:bg-gold-50 has-checked:ring-1 has-checked:ring-gold-400"
            >
              <input
                type="radio"
                name="status"
                value={option}
                defaultChecked={status === option}
                className="size-4 accent-gold-600"
              />
              <span className="text-[15px] text-ink-900">{STATUS_LABELS[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="reviewer_notes" className="block text-sm font-semibold text-ink-800">
          Reviewer notes
        </label>
        <p className="mt-1 text-sm text-ink-500">Internal only — never shown to the applicant.</p>
        <textarea
          id="reviewer_notes"
          name="reviewer_notes"
          rows={5}
          defaultValue={notes}
          className="mt-2 w-full resize-y rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-[15px] shadow-xs"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          Review saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink-900 px-5 py-2.5 text-[15px] font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save review"}
      </button>
    </form>
  );
}
