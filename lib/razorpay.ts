import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";

/** A Razorpay client, or null when keys aren't configured. */
export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

/**
 * Recomputes Razorpay's checkout signature (HMAC-SHA256 of
 * "order_id|payment_id" with the key secret) and compares it in constant
 * time. A client-reported "payment succeeded" is never trusted on its own.
 */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  let given: Buffer;
  try {
    given = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

/**
 * Checks a webhook's X-Razorpay-Signature: HMAC-SHA256 of the raw request
 * body with the webhook secret set in the Razorpay dashboard (not the key
 * secret). The body must be the exact bytes received, before JSON parsing.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}
