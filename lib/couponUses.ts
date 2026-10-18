import "server-only";
import { FieldValue, type Transaction } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import { findCoupon } from "./coupons";

/**
 * Uses of the codes that are only for their first N customers
 * (Coupon.limit): one count per code at couponUses/{code}, added to when an
 * invitation is published with it (inside the publish transaction).
 */
const ref = (code: string) => getAdminDb().collection("couponUses").doc(code);

/** Uses left for this code; Infinity when it has no limit. */
export async function couponUsesLeft(code: unknown): Promise<number> {
  const c = findCoupon(code);
  if (!c?.limit) return Infinity;
  const used = Number((await ref(c.code).get()).data()?.count ?? 0);
  return Math.max(0, c.limit - used);
}

/** Counts one use, inside the publish transaction. A payment already made
 * is honoured even if, at the very same moment, the last use was taken. */
export function countCouponUse(tx: Transaction, code: unknown) {
  const c = findCoupon(code);
  if (!c?.limit) return;
  tx.set(ref(c.code), { count: FieldValue.increment(1), updatedAt: Date.now() }, { merge: true });
}
