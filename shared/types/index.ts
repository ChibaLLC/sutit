import type { _ElementData, Item } from "@chiballc/nuxt-form-builder";
export type { Drizzle } from "~~/server/db";

export interface Response {
	statusCode: number;
	body?: any;
}

export type CloudAPI = {
	object: "whatsapp_business_account";
	entry: Array<{
		id: string;
		changes: Array<{
			value: {
				messaging_product: "whatsapp";
				metadata: {
					display_phone_number: string;
					phone_number_id: string;
				};
				contacts: Array<{
					profile: {
						name: string;
					};
					wa_id: string;
				}>;
				messages: Array<{
					from: string;
					id: string;
					timestamp: string;
					text: {
						body: string;
					};
					type: "text";
				}>;
			};
			field: "messages";
		}>;
	}>;
};

export type OnPremisesAPI = {
	contacts: Array<{
		profile: {
			name: string;
		};
		wa_id: string;
	}>;
	messages: Array<{
		from: string;
		id: string;
		timestamp: string;
		text: {
			body: string;
		};
		type: "text";
	}>;
};

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

type ResultParameter = {
	Key: string;
	Value: string | number;
};

type ReferenceItem = {
	Key: string;
	Value: string;
};

type ResultParameters = {
	ResultParameter: ResultParameter[];
};

type ReferenceData = {
	ReferenceItem: ReferenceItem[];
};

type Result = {
	ResultType: string;
	ResultCode: string;
	ResultDesc: string;
	OriginatorConversationID: string;
	ConversationID: string;
	TransactionID: string;
	ResultParameters: ResultParameters;
	ReferenceData: ReferenceData;
};

export type PayBillCreditMethod = {
	paybill_no: string;
	account_no: string;
};

export type BuyGoodsCreditMethod = {
	till_no: string;
};

export type PhoneCreditMethod = {
	phone: string;
};

export type CreditMethod = OneOf<[PayBillCreditMethod, BuyGoodsCreditMethod, PhoneCreditMethod]>;

export type BusinessPaybillResponse = {
	Result: Result;
};

export interface BusinessPaybillRequest {}

export type BusinessBuyGoodsRequest = BusinessPaybillRequest;

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
