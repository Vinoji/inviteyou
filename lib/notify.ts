import "server-only";

/**
 * Sends the owner their private links by WhatsApp, falling back to SMS,
 * through Twilio's Messages REST API (plain fetch, no SDK).
 *
 * Configuration (all optional; with none set, nothing is sent and the
 * post-purchase popup simply offers copy / send-to-yourself buttons):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN      required for either channel
 *   TWILIO_WHATSAPP_FROM                       e.g. "+14155238886"
 *   TWILIO_WHATSAPP_CONTENT_SID                approved WhatsApp template ("HX…")
 *                                              for "your invitation is live"
 *   TWILIO_WHATSAPP_RESTORED_CONTENT_SID       …and for "restored for 30 days"
 *   TWILIO_SMS_FROM or TWILIO_MESSAGING_SERVICE_SID
 *
 * WhatsApp only lets a business start a conversation with a pre-approved
 * template, so in production set the two template SIDs above. Both take
 * {{1}} = the invitation title and {{2}} = a link (the edit link for
 * "live", the guest link for "restored"). Without a template the free-text
 * body is sent, which works in Twilio's WhatsApp sandbox only. SMS to Indian numbers additionally needs DLT registration
 * of the sender and message template (done in the Twilio console).
 *
 * Never throws: a failed message must never fail a payment that succeeded.
 */

export type Channel = "whatsapp" | "sms";

export interface SendResult {
  sent: Channel | null;
}

async function twilioSend(params: Record<string, string>): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return false;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[notify] Twilio send failed", res.status, detail.slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[notify] Twilio send error", err);
    return false;
  }
}

/**
 * @param to    E.164 number, e.g. "+919876543210".
 * @param text  Full message for SMS / sandbox WhatsApp.
 * @param template  The WhatsApp template (its SID, if configured) and the
 *   values for its {{1}}, {{2}}.
 */
export async function sendToOwner(
  to: string,
  text: string,
  template: { sid: string | undefined; vars: [title: string, link: string] }
): Promise<SendResult> {
  if (!/^\+\d{11,15}$/.test(to)) return { sent: null };

  const waFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (waFrom) {
    const ok = await twilioSend({
      From: `whatsapp:${waFrom}`,
      To: `whatsapp:${to}`,
      ...(template.sid
        ? {
            ContentSid: template.sid,
            ContentVariables: JSON.stringify({ 1: template.vars[0], 2: template.vars[1] }),
          }
        : { Body: text }),
    });
    if (ok) return { sent: "whatsapp" };
  }

  const smsFrom = process.env.TWILIO_SMS_FROM;
  const service = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (smsFrom || service) {
    const ok = await twilioSend({
      To: to,
      Body: text,
      ...(service ? { MessagingServiceSid: service } : { From: smsFrom! }),
    });
    if (ok) return { sent: "sms" };
  }

  return { sent: null };
}
