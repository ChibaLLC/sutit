import type {
	fieldResponses,
	formFields,
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
	id: string;
	title: string;
	description?: string;
	pages: PageSchema[];
	createdBy: string;
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
	publishedAt: string;
	tags: string[];
	isPublic: boolean;
	requiresLogin: boolean;
	slug: string;
	createdAt?: string;
	updatedAt?: string;
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

export type FormSubmission = Submission & {
	form: Form;
	submitter: User;
	responses: (FormFieldResponse & { field: FormField })[];
	storeResponses: (FormStoreResponse & { item: FormStoreItem })[];
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
