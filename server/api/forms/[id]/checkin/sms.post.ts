import {
  ensureCheckinCode,
  getFormSubmissions,
  getParticipantUrl,
  getSubmissionDisplayName,
  getSubmissionPhone,
  markCheckinSmsSent,
} from "~~/server/services/submissions.service";
import { requireFormOwner } from "~~/server/utils/form-owner";
import { sendTextSmsTiara } from "~~/server/utils/sms/tiara";

type SmsKind = "pass" | "distance";

/** One standard SMS segment. Stay within it (and plain GSM-7 characters) so each message bills once. */
const SMS_LIMIT = 160;

/** Keeps only characters that don't force the SMS into Unicode (which cuts a segment to 70 chars). */
const toGsmSafe = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .,'!?&()\-:/]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildMessage = (kind: SmsKind, name: string, eventTitle: string, url: string) => {
  const first = toGsmSafe(name.split(/\s+/)[0] || "").slice(0, 15) || "there";
  const template = (title: string) =>
    kind === "pass"
      ? `Hi ${first}, your ${title} check-in pass: ${url}`
      : `Hi ${first}, submit the distance you covered at ${title}: ${url}`;

  // Give the event title whatever room is left in the segment.
  const room = SMS_LIMIT - template("").length;
  let title = toGsmSafe(eventTitle);
  if (title.length > room) title = title.slice(0, Math.max(room - 3, 0)).trimEnd() + "...";
  return template(title);
};

/**
 * Sends participants an SMS with their personal link (/p/<id>?c=<code>), to the phone they paid with.
 * - kind "pass": all completed submissions (link shows their QR code)
 * - kind "distance": only checked-in participants (link lets them submit their distance)
 * By default skips people who already received that SMS; pass `resend: true` to send again.
 */
export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  const { form } = await requireFormOwner(event, formId);

  const body = await readBody(event);
  const kind = body?.kind as SmsKind;
  if (kind !== "pass" && kind !== "distance") {
    throw createError({ statusCode: 400, statusMessage: 'kind must be "pass" or "distance"' });
  }
  const resend = body?.resend === true;
  const onlyIds: string[] | null = Array.isArray(body?.submissionIds) ? body.submissionIds : null;
  const sentKey = kind === "pass" ? "passSmsSentAt" : "distanceSmsSentAt";

  const all = await getFormSubmissions(formId!);
  const recipients = all.filter((s: any) => {
    if (s.status !== "completed") return false;
    if (onlyIds && !onlyIds.includes(s.id)) return false;
    if (kind === "distance" && !s.metadata?.checkin?.checkedInAt) return false;
    if (!resend && s.metadata?.checkin?.[sentKey]) return false;
    return true;
  });

  const noPhone: { submissionId: string; name: string }[] = [];
  const failed: { submissionId: string; name: string; error: string }[] = [];
  let sent = 0;

  const sendOne = async (s: any) => {
    const name = getSubmissionDisplayName(s);
    const phone = getSubmissionPhone(s);
    if (!phone) {
      noPhone.push({ submissionId: s.id, name });
      return;
    }
    try {
      const code = await ensureCheckinCode(s.id, s.metadata);
      const message = buildMessage(kind, name, form.title, getParticipantUrl(s.id, code));
      await sendTextSmsTiara({ phone, message });
      await markCheckinSmsSent(s.id, kind);
      sent++;
    } catch (e: any) {
      console.error(`Check-in SMS (${kind}) failed for submission ${s.id}:`, e);
      failed.push({ submissionId: s.id, name, error: e?.data?.message || e?.message || "Send failed" });
    }
  };

  // Small batches so we don't hammer the SMS provider.
  const BATCH = 5;
  for (let i = 0; i < recipients.length; i += BATCH) {
    await Promise.all(recipients.slice(i, i + BATCH).map(sendOne));
  }

  return {
    success: true,
    kind,
    total: recipients.length,
    sent,
    noPhone,
    failed,
    message: `Sent ${sent} of ${recipients.length} SMS`,
  };
});
