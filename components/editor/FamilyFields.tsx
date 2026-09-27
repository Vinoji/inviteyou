"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { inputClass } from "./FormFields";
import {
  FAMILY_RELATIONS,
  MAX_FAMILY_MEMBERS,
  type FamilyMember,
  type FamilyRelation,
  type FamilySide,
} from "@/lib/types";

/** Changes are updaters over the latest list, so quick repeated taps
 * (add, add, add) each build on the previous one instead of a stale copy. */
export type FamilyUpdate = (prev: FamilyMember[]) => FamilyMember[];

function SideFields({
  heading,
  members,
  onChange,
}: {
  heading: string;
  members: FamilyMember[];
  onChange: (update: FamilyUpdate) => void;
}) {
  const t = useTranslations("editor");

  function patch(index: number, change: Partial<FamilyMember>) {
    onChange((prev) => prev.map((m, i) => (i === index ? { ...m, ...change } : m)));
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{heading}</p>
      {members.length === 0 && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500">{t("familyEmpty")}</p>
      )}
      {members.map((m, i) => (
        <div
          key={i}
          className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-end gap-2">
            <label className="block min-w-0 flex-1">
              <span className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {t("familyRelationLabel")}
              </span>
              <select
                className={inputClass}
                value={m.relation}
                onChange={(e) => patch(i, { relation: e.target.value as FamilyRelation })}
              >
                {FAMILY_RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {t(`familyRelation.${r}`)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => onChange((prev) => prev.filter((_, j) => j !== i))}
              className="mb-1.5 shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              aria-label={t("familyRemove")}
            >
              <Trash2 size={15} />
            </button>
          </div>
          {m.relation === "other" && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {t("familyCustomLabel")}
              </span>
              <input
                className={inputClass}
                value={m.label}
                maxLength={40}
                onChange={(e) => patch(i, { label: e.target.value })}
                placeholder={t("familyCustomPlaceholder")}
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {t("familyNameLabel")}
            </span>
            <input
              className={inputClass}
              value={m.name}
              maxLength={150}
              onChange={(e) => patch(i, { name: e.target.value })}
              placeholder={t("familyNamePlaceholder")}
            />
          </label>
        </div>
      ))}
      {members.length < MAX_FAMILY_MEMBERS && (
        <button
          type="button"
          onClick={() =>
            onChange((prev) =>
              prev.length >= MAX_FAMILY_MEMBERS
                ? prev
                : [
                    ...prev,
                    { relation: prev.length === 0 ? "parents" : "grandparents", name: "", label: "" },
                  ]
            )
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <Plus size={14} aria-hidden />
          {t("familyAdd")}
        </button>
      )}
    </div>
  );
}

/** Editable family lines for both sides; each side may be left empty. */
export default function FamilyFields({
  brideHeading,
  groomHeading,
  brideMembers,
  groomMembers,
  onChange,
}: {
  brideHeading: string;
  groomHeading: string;
  brideMembers: FamilyMember[];
  groomMembers: FamilyMember[];
  onChange: (side: FamilySide, update: FamilyUpdate) => void;
}) {
  const t = useTranslations("editor");
  return (
    <div className="space-y-5">
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {t("familyGuide")} {t("familyLimit", { max: MAX_FAMILY_MEMBERS })}
      </p>
      <SideFields
        heading={brideHeading}
        members={brideMembers}
        onChange={(m) => onChange("bride", m)}
      />
      <SideFields
        heading={groomHeading}
        members={groomMembers}
        onChange={(m) => onChange("groom", m)}
      />
    </div>
  );
}
