import { insertData, invalidatePrepaidFormLink, needsIndividualPayment } from "../utils/queries";
import { getUserByUlId } from "~~/server/api/v1/users/utils/queries";
import { generateReceiptNumber, processFormPayments, sendPaymentMailReceipt, sendUserMail, validateFormLinkToken } from "../utils";
import type { Forms, Stores } from "@chiballc/nuxt-form-builder";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)
    const _data = await readBody(event) as {
        forms: Drizzle.Form.select & { pages: Forms },
        stores: Drizzle.Store.select & { store: Stores },
        phone: string,
        token: string
    }
    if (!_data) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No data provided"
    }, Status.badRequest)

    const [data, needsPay] = await needsIndividualPayment(formUlid, _data.forms.price_individual).catch(err => [err as Error, false] as [Error, boolean])
    if (data instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: data.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!data) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if (needsPay && (!_data.phone && !_data.token)) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "Need a phone number or a payment token"
    })

    if (data.forms.requireMerch && !hasBoughtMerch(_data.stores.store)) {
        return useHttpEnd(event, {
            statusCode: Status.badRequest,
            body: "You need to buy(like) something from the store section of the form"
        } as APIResponse<string>, Status.internalServerError)
    }

    const creator = await getUserByUlId(data.forms.userUlid).catch(err => err as Error)
    if (!creator) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: "Form Creator Not Found"
    } as APIResponse<string>, Status.internalServerError)
    if (creator instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: creator.message || "Unknown error while getting form creator"
    } as APIResponse<string>, Status.internalServerError)

    const [details, error] = await useAuth(event)

    async function insert(creator: Drizzle.User.select, data: {
        forms: Drizzle.Form.select;
        stores?: Drizzle.Store.select;
    }, user?: { email: string } | { phone: string }) {
        let formMail: string | undefined = (user as { email: string })?.email || details?.user.email;
        if (!formMail) {
            for (const key in _data.forms.pages) {
                for (const field of _data.forms.pages[key] || []) {
                    if (field.type === "email") {
                        formMail = field.value as string | undefined
                        break
                    }
                }
            }
        }
        const formResponse = await insertData(formUlid!, _data)
        sendUserMail({ email: creator!.email }, `New response on form ${data.forms.formName}`, `[Update] Submission ${data.forms.formName}`)
        if (formMail) {
            sendUserMail({ email: formMail }, `Form submission successful for ${data.forms.formName}`, `[Update] Successful form submission ${data.forms.formName}`)
        }

        const response = {} as APIResponse<number>
        response.statusCode = Status.success
        response.body = formResponse?.id as number

        return response
    }

    if (needsPay && !_data.token) {
        if (_data.forms.price_individual < data.forms.price_individual) {
            return useHttpEnd(event, {
                statusCode: 400,
                body: "Passed price is less than the allowed minimum for this form"
            })
        }
        return await processFormPayments(data.forms,
            { phone: _data.phone, amount: _data.forms.price_individual },
            creator?.email || creator?.name || "Unknown", (paymentUlid: string) => {
                insertData(formUlid, _data, _data.forms.price_individual).catch(log.error)
                sendUserMail({ email: creator?.email }, `${_data.phone} has paid KES: ${_data.forms.price_individual}.00 for your form ${data.forms.formName}`, `[Payment]: Confirmed payment on ${data.forms.formName}`)
                const receiptNumber = generateReceiptNumber(paymentUlid)

                let formMail: string | undefined = details?.user.email;
                if (!formMail) {
                    for (const key in _data.forms.pages) {
                        for (const field of _data.forms.pages[key] || []) {
                            if (field.type === "email") {
                                formMail = field.value as string | undefined
                                break
                            }
                        }
                    }
                }
                if (formMail) {
                    sendPaymentMailReceipt({ email: formMail }, _data.forms.price_individual, receiptNumber)
                    sendUserMail({ email: formMail }, `Payment successful for ${data.forms.formName}`, `[Update]: Payment Successful ${data.forms.formName}`)
                }
            }).catch(err => {
                return useHttpEnd(event, {
                    statusCode: Status.internalServerError,
                    body: err.message || "Unknown error while processing payment"
                } as APIResponse<string>, Status.internalServerError)
            })
    } else if (needsPay && _data.token) {
        const token = await validateFormLinkToken(_data.token).catch(e => e as Error)
        if (!token || token instanceof Error) {
            return useHttpEnd(event, {
                statusCode: 403,
                // @ts-ignore
                body: token?.message || "The provided token is not valid"
            })
        }

        const result = await insert(creator, data, token.user as any)
        invalidatePrepaidFormLink(token.token, result.body!)
        return result
    } else if (!needsPay) {
        return insert(creator, data)
    } else {
        return useHttpEnd(event, {
            statusCode: 400,
            body: "Bad Request"
        })
    }
})
