import { boolean, index, pgTable, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const user = pgTable(
  "users",
  {
    ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    salt: varchar("salt", { length: 255 }).notNull(),
    isDeleted: boolean("is_deleted"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("users_email_key").on(table.email)]
);

export const session = pgTable(
  "sessions",
  {
    ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
    userUlid: varchar("user_ulid", { length: 255 })
      .notNull()
      .references(() => user.ulid, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [index("token_index").on(table.token), unique("sessions_token_key").on(table.token)]
);
