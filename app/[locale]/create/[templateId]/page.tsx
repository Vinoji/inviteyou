import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TEMPLATE_IDS } from "@/lib/templates";
import { getTemplateMeta, getTemplatesByCategory } from "@/lib/i18n/templates";
import { getCategoryMeta } from "@/lib/i18n/categories";
import { showcaseProps } from "@/lib/i18n/showcase";
import {
  INVITATION_NAMESPACES,
  getContentMessages,
} from "@/lib/i18n/contentMessages";
import Editor from "./Editor";

/** Everything the editor renders in the *invitation's* language (preview,
 * story presets, seed content) — for both languages, so switching the
 * invitation language is instant and doesn't touch the UI language. */
const EDITOR_CONTENT_NAMESPACES = [...INVITATION_NAMESPACES, "storyPresets", "defaultContent"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}): Promise<Metadata> {
  const { locale, templateId } = await params;
  if (!TEMPLATE_IDS.includes(templateId)) return {};
  const t = await getTranslations({ locale, namespace: "templates" });
  const tEditor = await getTranslations({ locale, namespace: "editor" });
  const template = getTemplateMeta(templateId, t);
  return { title: tEditor("pageTitleCreate", { name: template.name }), robots: { index: false, follow: false } };
}

export default async function CreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; templateId: string }>;
  searchParams: Promise<{ edit?: string; token?: string }>;
}) {
  const { locale, templateId } = await params;
  const { edit, token } = await searchParams;
  setRequestLocale(locale);

  if (!TEMPLATE_IDS.includes(templateId)) notFound();

  const [en, ta, tTemplates, tCategories, tDefaults, tCommon] = await Promise.all([
    getContentMessages("en", EDITOR_CONTENT_NAMESPACES, templateId),
    getContentMessages("ta", EDITOR_CONTENT_NAMESPACES, templateId),
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "categories" }),
    getTranslations({ locale, namespace: "defaultContent" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  // The design picker's cards: each design in this occasion, playing its
  // real opening with its sample names (as on the home page).
  const current = getTemplateMeta(templateId, tTemplates);
  const singlePerson = getCategoryMeta(current.category, tCategories).singlePerson;
  const designs = getTemplatesByCategory(current.category, tTemplates).map((tpl) => ({
    id: tpl.id,
    name: tpl.name,
    tagline: tpl.tagline,
    showcase: showcaseProps(tpl, singlePerson, tDefaults, tCommon),
  }));

  return (
    <Editor
      templateId={templateId}
      editSlug={edit ?? null}
      editToken={token ?? null}
      contentMessages={{ en, ta }}
      designs={designs}
    />
  );
}
