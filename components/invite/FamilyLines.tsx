"use client";

import { useTranslations } from "next-intl";
import { scriptLang } from "@/lib/monogram";
import type { FamilyMember, FamilySide } from "@/lib/types";

/**
 * One line per family member, worded by relation and side: "Daughter of
 * <name>", "Grandson of <name>", "In the loving care of <name>"… The name is
 * wrapped by the message itself (<n>…</n>), so each language keeps its own
 * word order — Tamil puts the name first ("<name> அவர்களின் அன்பு மகள்").
 */
export default function FamilyLines({
  members,
  side,
  lineClassName,
  nameClassName,
}: {
  members: FamilyMember[];
  side: FamilySide;
  lineClassName?: string;
  nameClassName?: string;
}) {
  const t = useTranslations("invite.kin");
  if (members.length === 0) return null;
  return (
    <>
      {members.map((m, i) => (
        <div key={i} className={lineClassName}>
          {t.rich(m.relation, {
            side,
            label: m.label || "",
            name: m.name,
            n: (chunks) => (
              <span className={nameClassName} lang={scriptLang(m.name)}>
                {chunks}
              </span>
            ),
          })}
        </div>
      ))}
    </>
  );
}
