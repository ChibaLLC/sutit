import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid, type ULID } from "ulid";
import type { Pages } from "@chiballc/nuxt-form-builder";

export interface FormMeta {
  price?: {
    individual: number;
    group?:
      | {
          price?: number;
          limit?: number;
        }
      | false;
  };
  glossary: {
    inviteMessage?: string;
    description: string;
  };
  store?: {
    link: string;
    exclusive: boolean;
  };
}

export const form = pgTable("forms", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  meta: jsonb("meta").$type<FormMeta>().notNull(),
  blob: jsonb("pages").$type<Pages>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

type ResponseULID = ULID & {};
export interface Group {
  name: string;
  members: Record<Contact, ResponseULID | undefined>;
}
export const group = pgTable("groups", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  meta: jsonb().$type<Group>(),
  formUlid: varchar("ulid", { length: 255 })
    .references(() => form.ulid)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
