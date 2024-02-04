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

