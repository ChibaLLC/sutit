export type APIResponse = {
    statusCode: number;
    body?: any;
}

export enum Status {
    success = 200,
    created = 201,
    accepted = 202,
    noContent = 204,
    whatsappWebQR = 203,
    whatsappWebReady = 220,
    whatsappWebMessage = 206,
    SSEStart = 207,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    conflict = 409,
    unprocessableEntity = 422,
    internalServerError = 500,
    notImplemented = 501,
    badGateway = 502,
    serviceUnavailable = 503,
    gatewayTimeout = 504
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
    BusinessShortCode: number,
    Password: string,
    Timestamp: string,
    TransactionType: string,
    Amount: number,
    PartyA: number,
    PartyB: number,
    PhoneNumber: number,
    CallBackURL: string,
    AccountReference: string,
    TransactionDesc: string
}

export enum MpesaTransactionType {
    CustomerPayBillOnline = "CustomerPayBillOnline"
}

export type StkCallback = {
    MerchantRequestID: string,
    CheckoutRequestID: string,
    ResultCode: number,
    ResultDesc: string,
    CallbackMetadata: {
        Item: Array<{
            Name: string,
            Value: string | number
        }>
    }
}

export enum DarajaLinks {
    OAuth_Access_Token = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=",
    STK_Push = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
}

export const callBackIpWhitelist = [
    '196.201.214.200',
    '196.201.214.206',
    '196.201.213.114',
    '196.201.214.207',
    '196.201.214.208',
    '196.201.213.44',
    '196.201.212.127',
    '196.201.212.138',
    '196.201.212.129',
    '196.201.212.136',
    '196.201.212.74',
    '196.201.212.69'
]

export enum FieldEnum {
    TEXT = "text",
    PASSWORD = "password",
    EMAIL = "email",
    TEL = "tel",
    NUMBER = "number",
    DATE = "date",
    TIME = "time",
    FILE = "file",
    CHECKBOX = "checkbox",
    RADIO = "radio",
    SELECT = "select",
    TEXTAREA = "textarea",
}

export type Base = {
    placeholder?: string,
    label?: string,
    name: string,
    id?: string,
    value?: string,
    type: FieldEnum,
    description?: string,
    required?: boolean,
}

export type Select = Base & {
    options: string[]
}

export type Textarea = Base & {
    rows?: number
}

export type CheckboxInput = Base & {
    type: FieldEnum.CHECKBOX,
    checked?: boolean,
}

export type RadioInput = Base & {
    type: FieldEnum.RADIO,
    value: string,
    checked?: boolean,
}

export type FileInput = Base & {
    type: FieldEnum.FILE,
    accept?: string,
    multiple?: boolean,
}

export type DateInput = Base & {
    type: FieldEnum.DATE,
    min?: string,
    max?: string,
    exclude?: (date: Date) => boolean,
}

export type TimeInput = Base & {
    type: FieldEnum.TIME,
    min?: string,
    max?: string,
    step?: number,
    exclude?: (time: `${number}:${number}`) => boolean,
}

export type TextInput = Base & {
    type: FieldEnum.TEXT | FieldEnum.PASSWORD | FieldEnum.EMAIL | FieldEnum.TEL | FieldEnum.NUMBER,
    pattern?: string,
    minLength?: number,
    maxLength?: number,
}

export type Input = CheckboxInput | RadioInput | FileInput | DateInput | TimeInput | TextInput
export type FormField = Input | Select | Textarea


export type UserState = {
    email: string;
    is_admin: boolean;
    token: string;
}