import type { FamilyMember, FamilySide, InvitationData } from "./types";

type FamilySource = Pick<
  InvitationData,
  "brideFamily" | "groomFamily" | "brideParents" | "groomParents"
>;

/**
 * The family lines to show for one side. Documents saved before structured
 * family members existed only have the free-text brideParents/groomParents
 * line — that becomes a single "parents" entry, so older invitations render
 * exactly as before.
 */
export function getFamily(data: FamilySource, side: FamilySide): FamilyMember[] {
  const members = side === "bride" ? data.brideFamily : data.groomFamily;
  if (members) return members.filter((m) => m.name.trim());
  const legacy = (side === "bride" ? data.brideParents : data.groomParents)?.trim();
  return legacy ? [{ relation: "parents", name: legacy, label: "" }] : [];
}

/** The legacy one-line parents field, kept in sync for anything that still
 * reads it: the first parent-type entry's name. */
export function legacyParentsLine(members: FamilyMember[]): string {
  const parent = members.find(
    (m) => m.relation === "parents" || m.relation === "father" || m.relation === "mother"
  );
  return parent?.name.trim() ?? "";
}
