import { getPublicForms } from "~~/server/services/marketplace.service";
import { Filters } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const options: Filters = {
    limit: query.limit ? Number(query.limit) : 20,
    offset: query.offset ? Number(query.offset) : 0,
    search: query.search?.toString(),
    from: query.from?.toString(),
    to: query.to?.toString(),
    sort: query.sort?.toString(),
    order: query.order === "asc" || query.order === "desc" ? query.order : "desc",
    featured: ["true", "1"].includes(query.featured?.toString() || ""),
  };
  try {
    const forms = await getPublicForms(options);

    return {
      data: forms,
      count: forms.length,
      success: true,
    };
  } catch (e: any) {}
});
