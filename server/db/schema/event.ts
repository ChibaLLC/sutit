import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  varchar,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { forms } from "./form";

export const eventStatusEnum = pgEnum("event_status", ["upcoming", "ongoing", "past", "cancelled"]);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => forms.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).unique().notNull(),

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    timezone: varchar("timezone", { length: 100 }).default("UTC"),

    venueName: varchar("venue_name", { length: 500 }),
    venueAddress: text("venue_address"),
    venueMapUrl: varchar("venue_map_url", { length: 500 }),

    contactPhone: varchar("contact_phone", { length: 50 }),
    contactEmail: varchar("contact_email", { length: 255 }),

    category: varchar("category", { length: 100 }),
    audience: varchar("audience", { length: 255 }),
    images: jsonb("images").default([]),
    isFeatured: boolean("is_featured").default(false),
    isFree: boolean("is_free").default(true),
    refundPolicy: text("refund_policy"),

    status: eventStatusEnum("status").default("upcoming"),
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    formIdx: index("event_form_idx").on(table.formId),
    statusIdx: index("event_status_idx").on(table.status),
    startDateIdx: index("event_start_date_idx").on(table.startDate),
    slugIdx: index("event_slug_idx").on(table.slug),
    slugUnique: unique("event_slug_unique").on(table.slug),
  }),
);

export const eventsRelations = relations(events, ({ one }) => ({
  form: one(forms, {
    fields: [events.formId],
    references: [forms.id],
  }),
}));
