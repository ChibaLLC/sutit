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
