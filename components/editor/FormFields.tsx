import type { ReactNode } from "react";

/** A small on/off switch for toggling a section's visibility on the public page. */
export function SectionToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "Hide this section" : "Show this section"}
      onClick={() => onChange(!enabled)}
      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-600"
    >
      {enabled ? "Shown" : "Hidden"}
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? "bg-neutral-900" : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export function FormSection({
  title,
  children,
  toggle,
}: {
  title: string;
  children: ReactNode;
  /** When present, renders a Shown/Hidden switch next to the title and
   * dims (without disabling) the fields when toggled off. */
  toggle?: { enabled: boolean; onChange: (value: boolean) => void };
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
          {title}
        </h2>
        {toggle && <SectionToggle enabled={toggle.enabled} onChange={toggle.onChange} />}
      </div>
      <div className={`space-y-3 transition-opacity ${toggle && !toggle.enabled ? "opacity-45" : ""}`}>
        {children}
      </div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
