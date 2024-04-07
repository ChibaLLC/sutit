import {type APIResponse, Status} from "~/types";
import {getFormByUlid, hasPaid} from "~/server/mvc/forms/queries";
import {processFormPayments} from "~/server/mvc/forms/methods";

export default defineEventHandler(async event => {
    const formUlid = getRouterParam(event, "formUlid")
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await readBody(event) as { phone: string, identity: string | undefined }
    details.identity = details.identity || getHeader(event, "X-Request-ID")

    if (!details.phone || !details.identity) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "Phone and identity of the request origin are required; identity can be a UUID or a phone number with country code"
    }, Status.badRequest)

    const form = await getFormByUlid(formUlid).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form"
        } as APIResponse, Status.internalServerError)
    })
    
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)
    
    if(await hasPaid(form.form.id, details.phone)){
        return useHttpEnd(event, {
            statusCode: Status.success,
            body: "Payment already made"
        }, Status.success)
    }
    await processFormPayments(event, form, {identity: details.identity, phone: details.phone})
})