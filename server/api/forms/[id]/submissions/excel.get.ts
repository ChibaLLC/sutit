import { auth } from "~~/server/lib/auth";
import { getFormById } from "~~/server/services/form.service";
import { getFormSubmissions } from "~~/server/services/submissions.service";
import { exportToExcel } from "~~/server/utils/excel";

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, "id");
    if (!formId) {
      throw createError({ statusCode: 404, message: "Not Found" });
    }
    const session = auth.api.getSession({ headers: event.headers });
    if (!session) {
      throw createError({ statusCode: 401, message: "Unauthenticated" });
    }

    const query = getQuery(event);
    let submissions = await getFormSubmissions(formId);

    // Apply filters from query params
    if (query.status && query.status !== "all") {
      submissions = submissions.filter((s) => s.status === query.status);
    }

    if (query.dispatchStatus && query.dispatchStatus !== "all") {
      submissions = submissions.filter((s) => {
        const dStatus = s.dispatch?.status || "none";
        return dStatus === query.dispatchStatus;
      });
    }

    if (query.batchId && query.batchId !== "all") {
      submissions = submissions.filter((s) => {
        if (query.batchId === "unbatched") return !s.dispatch?.batchId;
        return s.dispatch?.batchId === query.batchId;
      });
    }

    if (query.search) {
      const term = String(query.search).toLowerCase();
      submissions = submissions.filter((s) => {
        const basicMatch =
          s.submitter?.name?.toLowerCase().includes(term) ||
          s.submitter?.email?.toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term);
        const fieldMatch = s.responses?.some((r) =>
          r.value?.toString().toLowerCase().includes(term),
        );
        return basicMatch || fieldMatch;
      });
    }

    if (query.dateStart) {
      const start = new Date(String(query.dateStart));
      submissions = submissions.filter((s) => new Date(s.submittedAt) >= start);
    }

    if (query.dateEnd) {
      const end = new Date(String(query.dateEnd));
      end.setHours(23, 59, 59, 999);
      submissions = submissions.filter((s) => new Date(s.submittedAt) <= end);
    }

    const buffer = await exportToExcel(submissions);
    const form = await getFormById(formId);

    setHeader(
      event,
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename=${form.slug}.xlsx`,
    );

    return buffer;
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      message: e.message || "An error occurred",
    });
  }
});
