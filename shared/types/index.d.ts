import type {
  fieldResponses,
  formFields,
  formGroupMembers,
  formGroups,
  forms,
  formSubmissions,
  storeItems,
  storeResponses,
  user,
} from "~~/server/db/schema";

export interface FormField {
  id: string;
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: string[];
  orderIndex: number;
  [key: string]: any;
}

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: string | number;
  message: string;
}
export interface PageSchema {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
  orderIndex: number;
}
export interface FormSchema {
  id?: string;
  title: string;
  description?: string;
  pages: PageSchema[];
  createdBy?: string;
  stores?: Store[];
  price: number;
  status: string;
  requireMerch: boolean;
  allowGroups: boolean;
  calculateTat: boolean;
  groupAmountPayable?: number;
  groupMemberLimit?: number;
  infoPromptMessage?: string;
  allowMultipleSubmissions: boolean;
  allowRegistrationReuse: boolean;
  submissionLimit: number | null;
  publishedAt?: string;
  tags: string[];
  isPublic: boolean;
  requiresLogin: boolean;
  requirePassword?: boolean;
  password?: string;
  acceptResponses?: boolean;
  expiresAt?: string;
  slug: string;
  afterSubmissionMessage?: string;
  createdAt?: string;
  updatedAt?: string;
  hasEvent?: boolean;
  event?: EventSchema;
}

export interface FormSettings {
  submitText?: string;
  resetText?: string;
  layout?: "vertical" | "horizontal" | "inline";
  spacing?: "tight" | "normal" | "loose";
  theme?: "light" | "dark" | "auto";
}

export interface DragItem {
  type: string;
  field?: FormField;
  fromIndex?: number;
}

export interface Store {
  id: number;
  name: string;
  description?: string;
  items: StoreItem[];
}

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  infinite: boolean;
  images: string[];
}

export interface EventSchema {
  id?: string;
  formId?: string;
  title: string;
  description?: string;
  slug: string;
  startDate: string;
  endDate?: string | null;
  timezone?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  category?: string;
  audience?: string;
  images: string[];
  isFeatured?: boolean;
  isFree?: boolean;
  refundPolicy?: string;
  status?: string;
  publishedAt?: string | null;
}

export interface SubmissionData {
  formData: Record<string, any>;
  paymentData?: {
    phoneNumber: string;
  };
  selectedProducts: Record<
    string,
    {
      quantity: number;
      storeId: string;
    }
  >;
  schema: FormSchema;
}
export type User = typeof user.$inferSelect;
export type Submission = typeof formSubmissions.$inferSelect;
export type Form = typeof forms.$inferSelect;
export type FormFieldResponse = typeof fieldResponses.$inferSelect;
export type FormStoreResponse = typeof storeResponses.$inferSelect;
export type FormField = typeof formFields.$inferSelect;
export type FormStoreItem = typeof storeItems.$inferSelect;

export type FormGroupMember = typeof formGroupMembers.$inferSelect & {
  group?: typeof formGroups.$inferSelect;
};

export type FormSubmission = Submission & {
  form: Form;
  submitter: User;
  responses: (FormFieldResponse & { field: FormField })[];
  storeResponses: (FormStoreResponse & { item: FormStoreItem })[];
  groupMembers?: FormGroupMember[];
};
export type StkCallback = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
};

export type StkCallbackHook = {
  Body: {
    stkCallback: StkCallback;
  };
};

export interface GroupMember {
  email: string;
  phone: string;
  paymentOption: "leader_pays" | "member_pays";
}

export interface CreateGroupRequest {
  groupName: string;
  members: GroupMember[];
  phoneNumber: string;
}
export interface Filters {
  limit?: number;
  offset?: number;
  search?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: "asc" | "desc";
  featured?: boolean;
}
