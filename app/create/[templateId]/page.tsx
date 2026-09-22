import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TEMPLATE_IDS, getTemplate } from "@/lib/templates";
import Editor from "./Editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const { templateId } = await params;
  if (!TEMPLATE_IDS.includes(templateId)) return {};
  const template = getTemplate(templateId);
  return { title: `Create — ${template.name}` };
}

export default async function CreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ edit?: string; token?: string }>;
}) {
  const { templateId } = await params;
  const { edit, token } = await searchParams;

  if (!TEMPLATE_IDS.includes(templateId)) notFound();

  return (
    <Editor
      templateId={templateId}
      editSlug={edit ?? null}
      editToken={token ?? null}
    />
  );
}
