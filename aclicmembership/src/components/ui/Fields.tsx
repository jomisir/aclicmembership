"use client";

import { useId, type ReactNode } from "react";

const baseControl =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink-900 shadow-xs transition placeholder:text-ink-400 disabled:cursor-not-allowed disabled:bg-ink-100";
const okBorder = "border-ink-200 hover:border-ink-300";
const errBorder = "border-rose-400 bg-rose-50/40";

function control(hasError?: boolean) {
  return `${baseControl} ${hasError ? errBorder : okBorder}`;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-ink-400">optional</span>
        )}
      </label>
      {hint ? <p className="mt-1 text-sm leading-relaxed text-ink-500">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  type?: "text" | "email" | "tel" | "number" | "date";
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  min?: number;
  max?: number;
  autoComplete?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  type = "text",
  placeholder,
  inputMode,
  min,
  max,
  autoComplete,
}: TextInputProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        min={min}
        max={max}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={control(Boolean(error))}
      />
    </Field>
  );
}

// ---------------------------------------------------------------------

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  rows = 4,
  placeholder,
  maxLength = 4000,
}: TextAreaProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${control(Boolean(error))} resize-y leading-relaxed`}
      />
      <p className="mt-1 text-right text-xs text-ink-400">
        {value.length} / {maxLength}
      </p>
    </Field>
  );
}

// ---------------------------------------------------------------------

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  placeholder?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  error,
  hint,
  required,
  placeholder = "Select an option",
}: SelectProps) {
  const id = useId();
  const normalised = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <select
        id={id}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={control(Boolean(error))}
      >
        <option value="">{placeholder}</option>
        {normalised.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

// ---------------------------------------------------------------------

interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string; description?: string }[];
  error?: string;
  hint?: ReactNode;
  required?: boolean;
}

export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  hint,
  required,
}: RadioGroupProps) {
  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      {hint ? <p className="mt-1 text-sm leading-relaxed text-ink-500">{hint}</p> : null}
      <div className="mt-2 grid gap-2">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition ${
                checked
                  ? "border-gold-500 bg-gold-50 ring-1 ring-gold-400"
                  : "border-ink-200 bg-white hover:border-ink-300"
              } ${error && !value ? "border-rose-300" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-4 shrink-0 accent-gold-600"
              />
              <span>
                <span className="block text-[15px] font-medium text-ink-900">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-sm text-ink-500">{option.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

// ---------------------------------------------------------------------

interface CheckboxProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function Checkbox({ label, checked, onChange, error }: CheckboxProps) {
  return (
    <div>
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition ${
          checked
            ? "border-gold-500 bg-gold-50 ring-1 ring-gold-400"
            : error
              ? "border-rose-300 bg-rose-50/40"
              : "border-ink-200 bg-white hover:border-ink-300"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-gold-600"
        />
        <span className="text-[15px] leading-relaxed text-ink-800">{label}</span>
      </label>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
