export type APIResponse = {
    statusCode: number;
    body?: any;
}

export enum Status {
    success = 200,
    created = 201,
    accepted = 202,
    noContent = 204,
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