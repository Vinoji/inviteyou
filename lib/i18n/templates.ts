import { TEMPLATES, getTemplateConfig, type TemplateConfig } from "@/lib/templates";
import type { CategoryId } from "@/lib/categories";

type TFunc = (key: string, values?: Record<string, string | number>) => string;

export interface TemplateMeta extends TemplateConfig {
  name: string;
  tagline: string;
  description: string;
}

/** `t` must be scoped to the `templates` namespace. */
export function getTemplateMeta(id: string, t: TFunc): TemplateMeta {
  const config = getTemplateConfig(id);
  return {
    ...config,
    name: t(`${config.id}.name`),
    tagline: t(`${config.id}.tagline`),
    description: t(`${config.id}.description`),
  };
}

export function getAllTemplateMeta(t: TFunc): TemplateMeta[] {
  return TEMPLATES.filter((tpl) => !tpl.hidden).map((tpl) => getTemplateMeta(tpl.id, t));
}

/** The designs offered for an occasion. Retired (hidden) designs are left
 * out, except `keepId` — the one an existing invitation already uses. */
export function getTemplatesByCategory(category: CategoryId, t: TFunc, keepId?: string): TemplateMeta[] {
  return TEMPLATES.filter((tpl) => tpl.category === category && (!tpl.hidden || tpl.id === keepId)).map((tpl) =>
    getTemplateMeta(tpl.id, t)
  );
}
