import {
  checkInSubmission,
  getSubmissionByCheckinCode,
  getSubmissionDisplayName,
} from "~~/server/services/submissions.service";
import { requireFormOwner } from "~~/server/utils/form-owner";

/** Pulls the submission ID and code out of a scanned participant link: .../p/<uuid>?c=<code> */
const parseScannedValue = (value: string) => {
  try {
    const url = new URL(value.trim());
    const match = url.pathname.match(/\/p\/([0-9a-f-]{36})\/?$/i);
    const code = url.searchParams.get("c");
    if (match && code) return { submissionId: match[1], code };
  } catch {
    // not a URL
  }
  return null;
};

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  const { session } = await requireFormOwner(event, formId);

  const body = await readBody(event);
  const parsed = parseScannedValue(String(body?.data || ""));
  if (!parsed) {
    return { result: "invalid", message: "This QR code is not a check-in pass" } as const;
  }

  let submission;
  try {
    submission = await getSubmissionByCheckinCode(parsed.submissionId, parsed.code);
  } catch {
    return { result: "invalid", message: "Pass not recognised" } as const;
  }

  const name = getSubmissionDisplayName(submission);

  if (submission.formId !== formId) {
    return {
      result: "wrong_event",
      message: `${name}'s pass is for "${submission.form?.title}", not this event`,
    } as const;
  }

  if (submission.status !== "completed") {
    return {
      result: "unpaid",
      submissionId: submission.id,
      name,
      message: `${name} has not completed payment (status: ${submission.status})`,
    } as const;
  }

  const { alreadyCheckedIn, checkin } = await checkInSubmission(
    formId!,
    submission.id,
    session.user.id,
  );

  return {
    result: alreadyCheckedIn ? "already_checked_in" : "checked_in",
    submissionId: submission.id,
    name,
    checkin,
    message: alreadyCheckedIn
      ? `${name} was already checked in at ${new Date(checkin!.checkedInAt!).toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit" })}`
      : `${name} checked in`,
  } as const;
});
