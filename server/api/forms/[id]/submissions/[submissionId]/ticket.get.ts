import { getSubmissionById } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const { id: formId, id: submissionId } = getRouterParams(event);

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid submission ID",
    });
  }

  const submission = await getSubmissionById(submissionId);

  if (!submission || submission.formId !== formId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission not found",
    });
  }

  // Create ticket data
  const ticket = {
    ticketId: submission.id,
    customer: submission.submitter?.name || "N/A",
    group: submission.groupMembers?.[0]?.group?.groupName || "N/A",
    issueDate: submission.submittedAt,
    status: submission.status,
    services: ["Form Payment", "Product Sales"],
  };

  // Set headers for download
  setHeader(event, "Content-Type", "application/json");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="ticket-${submission.id}.json"`,
  );

  return ticket;
});
