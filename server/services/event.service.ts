import {
  and,
  eq,
  ilike,
  isNull,
  lt,
  or,
  sql,
  gte,
  lte,
  ne,
  count as drizzleCount,
  type InferInsertModel,
} from "drizzle-orm";
import { slugify } from "~~/shared/utils/form.schema";

import db from "../db";
import { events } from "../db/schema";

export type NewEvent = InferInsertModel<typeof events>;

export const createEvent = async (payload: NewEvent, tx: typeof db) => {
  let uniqueSlug = slugify(payload.slug || payload.title);

  const existing = await tx.query.events.findFirst({
    where: eq(events.slug, uniqueSlug),
  });

  if (existing) {
    uniqueSlug = slugify(`${uniqueSlug}-${Date.now().toString(36)}`);
  }

  const [newEvent] = await tx
    .insert(events)
    .values({
      ...payload,
      slug: uniqueSlug,
      startDate: payload.startDate ? new Date(payload.startDate as any) : new Date(),
      endDate: payload.endDate ? new Date(payload.endDate as any) : null,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt as any) : new Date(),
    })
    .returning();

  return newEvent;
};

export const getEventById = async (eventId: string) => {
  return await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      form: {
        columns: eventFormColumns,
      },
    },
  });
};

export const getEventBySlug = async (slug: string) => {
  return db.query.events.findFirst({
    where: eq(sql`lower(${events.slug})`, slug.toLowerCase()),
    with: {
      form: {
        columns: eventFormColumns,
      },
    },
  });
};

export const updateEvent = async (eventId: string, payload: Partial<NewEvent>, tx: typeof db) => {
  const updateData: Partial<NewEvent> = { ...payload };

  if (payload.startDate) updateData.startDate = new Date(payload.startDate as any);
  if (payload.endDate) updateData.endDate = new Date(payload.endDate as any);
  if (payload.publishedAt) updateData.publishedAt = new Date(payload.publishedAt as any);

  const [updated] = await tx
    .update(events)
    .set(updateData)
    .where(eq(events.id, eventId))
    .returning();

  return updated;
};

export const deleteEvent = async (eventId: string, tx: typeof db) => {
  const result = await tx.delete(events).where(eq(events.id, eventId)).returning();
  return result[0];
};

const buildEventConditions = (options?: {
  status?: string;
  category?: string;
  from?: string;
  to?: string;
  search?: string;
}) => {
  const conditions = [];

  if (options?.status) {
    conditions.push(eq(events.status, options.status as any));
  }
  if (options?.category) {
    conditions.push(eq(events.category, options.category));
  }
  if (options?.from) {
    conditions.push(gte(events.startDate, new Date(options.from)));
  }
  if (options?.to) {
    conditions.push(lte(events.startDate, new Date(options.to)));
  }
  if (options?.search) {
    conditions.push(
      or(
        ilike(events.title, `%${options.search}%`),
        ilike(events.description, `%${options.search}%`),
        ilike(events.venueName, `%${options.search}%`),
      ),
    );
  }

  return conditions;
};

const eventFormColumns = { id: true, slug: true, title: true, price: true, status: true, requiresLogin: true } as const;

export const getPublicEvents = async (options?: {
  status?: string;
  category?: string;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const conditions = buildEventConditions(options);

  const result = await db.query.events.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      form: {
        columns: eventFormColumns,
      },
    },
    orderBy: (e, { desc }) => [desc(e.startDate)],
    limit: Math.min(options?.limit || 20, 50),
    offset: options?.offset || 0,
  });

  return result;
};

export const getPublicEventsCount = async (options?: {
  status?: string;
  category?: string;
  from?: string;
  to?: string;
  search?: string;
}) => {
  const conditions = buildEventConditions(options);

  const [result] = await db
    .select({ total: drizzleCount() })
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result?.total ?? 0;
};

export const getRelatedEvents = async (eventId: string, limit = 3) => {
  const event = await getEventById(eventId);
  if (!event) return [];

  return db.query.events.findMany({
    where: and(
      ne(events.id, eventId),
      eq(events.status, "upcoming"),
      event.category ? eq(events.category, event.category) : undefined,
    ),
    with: {
      form: {
        columns: eventFormColumns,
      },
    },
    orderBy: (e, { asc }) => [asc(e.startDate)],
    limit,
  });
};

export const syncEventStatuses = async () => {
  const now = new Date();

  await db
    .update(events)
    .set({ status: "ongoing" })
    .where(
      and(
        eq(events.status, "upcoming"),
        lte(events.startDate, now),
        or(isNull(events.endDate), gte(events.endDate, now)),
      ),
    );

  await db
    .update(events)
    .set({ status: "past" })
    .where(
      or(
        and(eq(events.status, "upcoming"), lt(events.endDate, now)),
        and(eq(events.status, "ongoing"), lt(events.endDate, now)),
      ),
    );
};
