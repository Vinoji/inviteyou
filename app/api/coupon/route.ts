import { NextRequest, NextResponse } from "next/server";
import { findCoupon } from "@/lib/coupons";
import { couponUsesLeft } from "@/lib/couponUses";
import { tooMany } from "@/lib/rateLimit";

/** How many uses a first-N-customers code has left (for the checkout to
 * say so before payment). The draft and order routes check again. */
export async function GET(req: NextRequest) {
  const limited = tooMany(req, "coupon", 60, 60 * 60 * 1000);
  if (limited) return limited;
  const code = req.nextUrl.searchParams.get("code");
  const c = findCoupon(code);
  if (!c) return NextResponse.json({ valid: false });
  const left = await couponUsesLeft(c.code);
  return NextResponse.json({ valid: true, left: Number.isFinite(left) ? left : null });
}
