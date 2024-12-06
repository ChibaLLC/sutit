type SMSPayloadBase = {
    userid: string;
    password: string;
    senderid: string;
    output: "json";
    msgType: "text";
    duplicatecheck: "true" | "false";
}

type SMSBulkPayload = { sendMethod: "bulkupload"; file: string }
export type SMSQuickPayloadSingle = { mobile: string, msg: string }
export type SMSQuickPayloadMultiple = {
    sms: {
        mobile: string[];
        msg: string;
    }[];
}
type SMSQuickPayload = { sendMethod: "quick"; } & (SMSQuickPayloadSingle | SMSQuickPayloadMultiple)
type SMSGroupPayload = { sendMethod: "group"; group: string; };

export type SMSPayload = SMSPayloadBase & (SMSGroupPayload | SMSQuickPayload | SMSBulkPayload)
