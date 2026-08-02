import type { FieldErrors } from "@/lib/form-schema";
import type { FormValues } from "@/lib/form-values";

export type SetField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;

export interface StepProps {
  values: FormValues;
  setField: SetField;
  errors: FieldErrors;
}
