import { notFound } from "next/navigation";
import PaymentsLab from "./PaymentsLab";

export const metadata = { title: "Payments lab (dev)", robots: { index: false, follow: false } };

/** DEVELOPMENT ONLY: every payment scenario in one place. 404 in production. */
export default function DevPaymentsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  return <PaymentsLab mode={keyId.startsWith("rzp_test_") ? "test" : keyId ? "live" : "none"} />;
}
