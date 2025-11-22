import { and, between, eq, ilike } from "drizzle-orm";
import { forms } from "../db/schema";
import { Filters } from "~~/shared/types";
import db from "../db";
const buildPublicFormFilters = (options?: Filters) => {
  return [
    eq(forms.isPublic, true),
    eq(forms.isFeatured, options?.featured || false),
    options?.search && ilike(forms.title, `%${options.search}%`),
    options?.from &&
      options?.to &&
      between(forms.createdAt, new Date(options.from), new Date(options.to)),
  ].filter(Boolean);
};

export const getPublicForms = async (options?: Filters) => {
  const filters = buildPublicFormFilters(options);

  return await db.query.forms.findMany({
    where: and(...filters),
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    limit: options?.limit ?? 50,
    offset: options?.offset,
    orderBy: (form, { asc, desc }) => [
      options?.order === "asc" ? asc(form.createdAt) : desc(form.createdAt),
    ],
  });
};
