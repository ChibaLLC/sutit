import type { _ElementData, Item } from "@chiballc/nuxt-form-builder";
export type { Drizzle } from "~~/server/db";

export interface Response {
	statusCode: number;
	body?: any;
}

export type MpesaStkRequest = {
	BusinessShortCode: number;
	Password: string;
	Timestamp: string;
	TransactionType: string;
	Amount: number;
	PartyA: number;
	PartyB: number;
	PhoneNumber: number;
	CallBackURL: string;
	AccountReference: string;
	TransactionDesc: string;
};

export enum MpesaTransactionType {
	CustomerPayBillOnline = "CustomerPayBillOnline",
}

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

export type B2cCallback = {
	Result: {
		ResultType: number;
		ResultCode: number;
		ResultDesc: string;
		OriginatorConversationID: string;
		ConversationID: string;
		TransactionID: string;
		ResultParameters: {
			ResultParameter: {
				Key: string;
				Value: string | number;
			}[];
		};
		ReferenceData: {
			ReferenceItem: {
				Key: string;
				Value: string;
			};
		};
	};
};


export type UserState = {
	email: string;
	is_admin: boolean;
	token: string;
};
export interface GoogleCredential {
	clientId: string;
	client_id: string;
	credential: string;
	select_by: string;
}

export type NotificationOptions = {
	timeout?: number | "never";
	intensity?: "info" | "success" | "error";
};

export type DbPage = Drizzle.SutitForm[];
export type DbStore = ((Omit<Drizzle.SutitStore, "stock"> & Omit<Item, "stock">) & { stock: Item["stock"] })[];
export type ReconstructedDbForm = {
  meta: Drizzle.SutitForm;
  pages: Record<number | string, DbPage>;
  stores: Record<number | string, DbStore>;
};
