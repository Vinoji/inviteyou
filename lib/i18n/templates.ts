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
  return TEMPLATES.map((tpl) => getTemplateMeta(tpl.id, t));
}

export function getTemplatesByCategory(category: CategoryId, t: TFunc): TemplateMeta[] {
  return TEMPLATES.filter((tpl) => tpl.category === category).map((tpl) =>
    getTemplateMeta(tpl.id, t)
  );
}
