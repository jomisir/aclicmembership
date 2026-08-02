"use client";

import { useRef, useState } from "react";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, type UploadedFile } from "@/lib/form-schema";
import { LETTERS_BUCKET } from "@/lib/constants";
import { formatBytes } from "@/lib/labels";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const EXTENSION_TO_TYPE: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  webp: "image/webp",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx";

/** Browsers sometimes report an empty MIME type (notably HEIC on iOS). */
function resolveContentType(file: File): string | null {
  if (file.type && file.type in ACCEPTED_UPLOAD_TYPES) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_TYPE[extension] ?? null;
}

interface FileUploadProps {
  value: UploadedFile | null;
  onChange: (value: UploadedFile | null) => void;
  error?: string;
  /** Bubbled up so the wizard can block "Next" while a file is in flight. */
  onUploadingChange?: (uploading: boolean) => void;
}

export function FileUpload({ value, onChange, error, onUploadingChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  async function handleFile(file: File) {
    setLocalError(null);

    const contentType = resolveContentType(file);
    if (!contentType) {
      setLocalError("That file type is not supported. Use a PDF, a photo (JPG/PNG/HEIC), or a Word document.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setLocalError(
        `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)} — try a smaller photo or a PDF.`,
      );
      return;
    }
    if (file.size === 0) {
      setLocalError("That file appears to be empty.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType, size: file.size }),
      });

      const payload = (await response.json()) as {
        path?: string;
        token?: string;
        error?: string;
      };

      if (!response.ok || !payload.path || !payload.token) {
        throw new Error(payload.error ?? "Could not prepare the upload.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from(LETTERS_BUCKET)
        .uploadToSignedUrl(payload.path, payload.token, file, { contentType });

      if (uploadError) throw new Error(uploadError.message);

      onChange({ path: payload.path, name: file.name, size: file.size, type: contentType });
    } catch (cause) {
      setLocalError(
        cause instanceof Error
          ? `Upload failed: ${cause.message}`
          : "Upload failed. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shownError = localError ?? error;

  return (
    <div>
      <span className="block text-sm font-semibold text-ink-800">
        Recommendation letter
        <span className="ml-1 text-rose-600" aria-hidden="true">
          *
        </span>
      </span>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">
        Upload a signed letter from a teacher, club leader, mentor or community leader who
        recommends you. A clear photo is fine. PDF, JPG, PNG, HEIC or Word, up to{" "}
        {formatBytes(MAX_UPLOAD_BYTES)}.
      </p>

      {value ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-emerald-900">{value.name}</p>
            <p className="text-sm text-emerald-700">{formatBytes(value.size)} · uploaded</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setLocalError(null);
            }}
            className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
          >
            Replace
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <input
            ref={inputRef}
            id="recommendation-letter"
            type="file"
            accept={ACCEPT_ATTR}
            disabled={uploading}
            aria-invalid={Boolean(shownError)}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
            className={`block w-full cursor-pointer rounded-lg border text-sm text-ink-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-ink-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800 disabled:opacity-60 ${
              shownError ? "border-rose-400 bg-rose-50/40" : "border-ink-200 bg-white"
            }`}
          />
          {uploading ? (
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-600">
              <span className="size-3 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
              Uploading…
            </p>
          ) : null}
        </div>
      )}

      {shownError ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
