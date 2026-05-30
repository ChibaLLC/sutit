import { getPublicEvents, getPublicEventsCount } from "~~/server/services/event.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const limit = Math.min(query.limit ? Number(query.limit) : 20, 50);
  const offset = query.offset ? Math.max(Number(query.offset), 0) : 0;

  const filters = {
    status: query.status as string | undefined,
    category: query.category as string | undefined,
    from: query.from as string | undefined,
    to: query.to as string | undefined,
    search: query.search as string | undefined,
  };

  const [events, total] = await Promise.all([
    getPublicEvents({ ...filters, limit, offset }),
    getPublicEventsCount(filters),
  ]);

  return {
    data: events,
    total,
    limit,
    offset,
  };
});
