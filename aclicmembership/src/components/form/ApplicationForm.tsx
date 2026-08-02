"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  firstStepWithError,
  STEPS,
  validateAll,
  validateStep,
  type FieldErrors,
  type StepId,
} from "@/lib/form-schema";
import { initialValues, readDraft, type FormValues } from "@/lib/form-values";
import { DRAFT_KEY } from "@/lib/constants";
import { StepProgress } from "./StepProgress";
import { PersonalStep } from "./steps/PersonalStep";
import { MotivationStep } from "./steps/MotivationStep";
import { RightsStep } from "./steps/RightsStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { CommitmentStep } from "./steps/CommitmentStep";
import { DeclarationStep } from "./steps/DeclarationStep";
import { ReviewStep } from "./steps/ReviewStep";

const noopSubscribe = () => () => {};

/**
 * The saved draft lives in localStorage, which the server cannot see. We
 * render a placeholder for the server and the hydration pass, then swap in
 * the real form — so the draft can be read straight from a `useState`
 * initializer with no hydration mismatch and no setState-in-effect.
 */
export function ApplicationForm() {
  const onClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!onClient) return <FormSkeleton />;
  return <ApplicationFormBody />;
}

function FormSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-2 w-full rounded-full bg-ink-200" />
      <div className="mt-8 h-7 w-2/3 rounded bg-ink-200" />
      <div className="mt-6 grid gap-6">
        {[0, 1, 2, 3].map((row) => (
          <div key={row}>
            <div className="h-4 w-40 rounded bg-ink-200" />
            <div className="mt-2 h-11 w-full rounded-lg bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationFormBody() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const [restoredDraft] = useState(readDraft);
  const [values, setValues] = useState<FormValues>(restoredDraft.values);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftDismissed, setDraftDismissed] = useState(false);

  const step = STEPS[stepIndex];
  const draftRestored = restoredDraft.restored && !draftDismissed;

  // --- Draft: save as the applicant types ----------------------------
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        // Storage full or blocked (private mode) — the form still works.
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values]);

  const setField = useCallback<
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => void
  >((key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!Object.keys(previous).some((k) => k === key || k.startsWith(`${key}.`))) {
        return previous;
      }
      const next = { ...previous };
      for (const k of Object.keys(next)) {
        if (k === key || k.startsWith(`${key}.`)) delete next[k];
      }
      return next;
    });
  }, []);

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const focusFirstError = useCallback(() => {
    window.requestAnimationFrame(() => {
      const invalid = document.querySelector<HTMLElement>(
        '[aria-invalid="true"], [role="alert"]',
      );
      invalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (invalid instanceof HTMLInputElement || invalid instanceof HTMLTextAreaElement) {
        invalid.focus({ preventScroll: true });
      }
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setStepIndex(index);
      setFurthestIndex((previous) => Math.max(previous, index));
      scrollToTop();
    },
    [scrollToTop],
  );

  const goToStepId = useCallback(
    (id: StepId) => {
      const index = STEPS.findIndex((s) => s.id === id);
      if (index >= 0) goTo(index);
    },
    [goTo],
  );

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(values, step.id);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      focusFirstError();
      return;
    }
    setErrors({});
    goTo(Math.min(stepIndex + 1, STEPS.length - 1));
  }, [values, step.id, stepIndex, goTo, focusFirstError]);

  const handleBack = useCallback(() => {
    setErrors({});
    goTo(Math.max(stepIndex - 1, 0));
  }, [stepIndex, goTo]);

  const handleStartOver = useCallback(() => {
    if (!window.confirm("Clear this application and start again? This cannot be undone.")) return;
    window.localStorage.removeItem(DRAFT_KEY);
    setValues(initialValues());
    setErrors({});
    setDraftDismissed(true);
    setFurthestIndex(0);
    goTo(0);
  }, [goTo]);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);

    const validation = validateAll(values);
    if (!validation.ok) {
      setErrors(validation.errors);
      const target = firstStepWithError(validation.errors);
      if (target) goToStepId(target);
      setSubmitError("Some answers still need attention. We have taken you back to fix them.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as {
        referenceCode?: string;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok) {
        if (payload.fieldErrors && Object.keys(payload.fieldErrors).length > 0) {
          setErrors(payload.fieldErrors);
          const target = firstStepWithError(payload.fieldErrors);
          if (target) goToStepId(target);
        }
        throw new Error(payload.error ?? "We could not submit your application.");
      }

      window.localStorage.removeItem(DRAFT_KEY);
      router.push(`/thank-you?ref=${encodeURIComponent(payload.referenceCode ?? "")}`);
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Check your connection and try again.",
      );
      setSubmitting(false);
    }
  }, [values, router, goToStepId]);

  const isReview = step.id === "review";

  return (
    <div ref={topRef} className="scroll-mt-6">
      <StepProgress currentIndex={stepIndex} furthestIndex={furthestIndex} onJump={goTo} />

      {draftRestored && stepIndex === 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-sm text-sky-900">
            We restored the answers you saved on this device.
          </p>
          <button
            type="button"
            onClick={handleStartOver}
            className="text-sm font-semibold text-sky-800 underline underline-offset-2"
          >
            Start over
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">
          <span className="text-gold-600">{step.number}.</span> {step.title}
        </h2>
        {step.blurb ? (
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{step.blurb}</p>
        ) : null}
      </div>

      <form
        className="mt-6"
        // Our own messages are friendlier and consistently placed; without
        // this the browser's native bubble fires first and Zod never runs.
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (isReview) void handleSubmit();
          else handleNext();
        }}
      >
        {step.id === "personal" ? (
          <PersonalStep values={values} setField={setField} errors={errors} />
        ) : null}
        {step.id === "motivation" ? (
          <MotivationStep values={values} setField={setField} errors={errors} />
        ) : null}
        {step.id === "rights" ? (
          <RightsStep values={values} setField={setField} errors={errors} />
        ) : null}
        {step.id === "experience" ? (
          <ExperienceStep
            values={values}
            setField={setField}
            errors={errors}
            onUploadingChange={setUploading}
          />
        ) : null}
        {step.id === "commitment" ? (
          <CommitmentStep values={values} setField={setField} errors={errors} />
        ) : null}
        {step.id === "declaration" ? (
          <DeclarationStep values={values} setField={setField} errors={errors} />
        ) : null}
        {isReview ? <ReviewStep values={values} onEdit={goToStepId} /> : null}

        {submitError ? (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          >
            {submitError}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ink-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0 || submitting}
            className="rounded-lg border border-ink-300 bg-white px-5 py-2.5 text-[15px] font-semibold text-ink-700 transition hover:bg-ink-50 disabled:invisible"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            {!isReview ? (
              <span className="hidden text-sm text-ink-500 sm:inline">
                Your answers save automatically
              </span>
            ) : null}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 rounded-lg bg-ink-900 px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {submitting
                ? "Submitting…"
                : uploading
                  ? "Waiting for upload…"
                  : isReview
                    ? "Submit application"
                    : "Save and continue →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
