import {z} from "zod";
import {getFormByUlid, insertGroupFormResponse, needsGroupPayment} from "../utils/queries";
import {getUserByUlId} from "~~/server/api/v1/users/utils/queries";
import {
    generateFormLinkTokens,
    processFormPayments,
    sendResponseInvites,
    sendUserMail
} from "../utils";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) {
        return createError({
            message: "No form ulid provided",
            status: 400
        })
    }

    const schema = z.object({
        invites: z.array(z.union([
            z.object({email: z.string()}),
            z.object({phone: z.string()})
        ])),
        phone: z.string(),
        origin: z.string(),
        group_name: z.string()
    })

    const {data, error} = await readValidatedBody(event, schema.safeParse)
    if (!data || error) {
        return createError({
            data: error,
            status: 400,
            message: error.message || "An unknown body parse error"
        })
    }

    const db_form = await getFormByUlid(formUlid).catch(e => e as Error)
    if (!db_form || db_form instanceof Error) {
        return createError({
            status: 404,
            message: "Form Not Found"
        })
    }

    if (db_form.forms.price_group_count && data.invites.length > db_form.forms.price_group_count) {
        return createError({
            status: 403,
            message: "Sorry, these group members are more than the allowed number"
        })
    }

    const amount = db_form.forms.price_group_amount ? db_form.forms.price_group_amount : db_form.forms.price_individual * data.invites.length
    const [form, needsPay] = await needsGroupPayment(db_form, amount)
    if (needsPay) {
        const creator = await getUserByUlId(db_form.forms.userUlid).catch(err => err as Error)
        if (creator instanceof Error) return createError({
            status: 404,
            message: "Form creator not found"
        })
        return await processFormPayments(db_form.forms, {
            phone: data.phone,
            amount: amount
        }, creator?.email || creator?.name || "Unknown", async (payment) => {
            const gr = await insertGroupFormResponse({
                formUlid: db_form.forms.ulid,
                groupName: data.group_name,
                invites: data.invites,
                paymentUlid: payment
            })
            const links = (await generateFormLinkTokens({
                form: form,
                formPaymentulid: payment
            }, data.invites, gr)).map(bud => `${data.origin}/forms/${form.forms.ulid}?token=${bud}`)
            const message = form.forms.price_group_message?.padEnd(1, " ")
            sendResponseInvites(data.invites, links, message)
            sendUserMail({email: creator!.email}, `Group ${data.group_name} has paid for form ${form.forms.formName} and was processesed successfully`, `[Payment]: Group ${form.forms.formName}`)
        })
    } else {
        const links = (await generateFormLinkTokens({
            form: form
        }, data.invites)).map(bud => `${data.origin}/forms/${form.forms.ulid}?token=${bud}`)
        const message = form.forms.price_group_message?.padEnd(1, " ")
        sendResponseInvites(data.invites, links, message)
        return {
            statusCode: 204,
            body: "OK"
        }
    }
})