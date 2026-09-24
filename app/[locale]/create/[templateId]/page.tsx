import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TEMPLATE_IDS } from "@/lib/templates";
import { getTemplateMeta } from "@/lib/i18n/templates";
import Editor from "./Editor";

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
  return { title: tEditor("pageTitleCreate", { name: template.name }) };
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

  return (
    <Editor
      templateId={templateId}
      editSlug={edit ?? null}
      editToken={token ?? null}
    />
  );
}
