"use client";

import { createContext, useContext } from "react";
import { useTranslations } from "next-intl";
import { getTemplateConfig } from "@/lib/templates";
import type { WorldId } from "./shots";

/** Which 3D world a template walks through (TemplateConfig.pageLayout). */
export function worldOf(templateId: string): WorldId {
  const layout = getTemplateConfig(templateId).pageLayout;
  if (layout === "temple3d") return "temple";
  if (layout === "cathedral3d") return "cathedral";
  if (layout === "park3d") return "park";
  return "palace";
}

/** The world of the invitation being shown, for the sections' wording. */
export const WorldContext = createContext<WorldId>("palace");

type Values = Record<string, string | number>;

/**
 * Translations for a section of the 3D templates: the palace wording in
 * `invite.palace.<ns>`, with a temple or cathedral version taking over
 * where `invite.palace.worlds.<world>.<ns>` has one ("In the Temple
 * Mandapam" instead of "In the Palace Courtyard").
 */
export function usePalaceT(ns: string, world?: WorldId) {
  const fromContext = useContext(WorldContext);
  const w = world ?? fromContext;
  const base = useTranslations(`invite.palace.${ns}`);
  const all = useTranslations("invite.palace");
  return (key: string, values?: Values) => {
    const override = `worlds.${w}.${ns}.${key}`;
    return w !== "palace" && all.has(override) ? all(override, values) : base(key, values);
  };
}
