"use client";

import { STEPS } from "@/lib/form-schema";

interface StepProgressProps {
  currentIndex: number;
  furthestIndex: number;
  onJump: (index: number) => void;
}

export function StepProgress({ currentIndex, furthestIndex, onJump }: StepProgressProps) {
  const percent = Math.round(((currentIndex + 1) / STEPS.length) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-ink-700">
          Step {currentIndex + 1} of {STEPS.length}
        </p>
        <p className="text-sm text-ink-500">{percent}% complete</p>
      </div>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Application progress"
      >
        <div
          className="h-full rounded-full bg-gold-500 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-4 hidden flex-wrap gap-1.5 md:flex">
        {STEPS.map((step, index) => {
          const reached = index <= furthestIndex;
          const current = index === currentIndex;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reached}
                onClick={() => onJump(index)}
                aria-current={current ? "step" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  current
                    ? "bg-ink-900 text-gold-300"
                    : reached
                      ? "bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100"
                      : "cursor-not-allowed bg-transparent text-ink-300"
                }`}
              >
                {step.number}. {step.short}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
