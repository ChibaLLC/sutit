import {
    needsIndividualPayment,
    createForm,
    createStore,
    getFormByUlid,
    getFormPaymentsSum,
    getFormResponses,
    getFormsByUser,
    insertData,
    updateForm,
    updateStore,
    invalidatePrepaidFormLink
} from "../../mvc/forms/queries";
import type { Forms, Stores } from "@chiballc/nuxt-form-builder";
import { constructExcel, deleteUserForm, generateFormLinkTokens, getStats, processFormPayments, sendResponseInvites, sendUserMail, validateFormLinkToken, withdrawFunds } from "./methods";
import { getUserByUlId } from "../users/queries";
import { z } from 'zod'

const router = createRouter()

router.get('/:formUlid', defineEventHandler(async event => {
    const formUuid = getRouterParam(event, "formUlid")
    if (!formUuid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const form = await getFormByUlid(formUuid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form?.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    const response = {} as APIResponse<{ forms: Drizzle.Form.select, stores: Drizzle.Store.select }>
    response.statusCode = Status.success
    response.body = form as any

    return response
}))

router.post('/create', defineEventHandler(async event => {
    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: error
    }, Status.unauthorized)

    const form = await readBody(event) as {
        name: string,
        description: string,
        allowGroups: boolean
        payment: {
            amount: number,
            group_amount?: number,
            group_limit?: number
        },
        formData: {
            pages: Forms,
            stores: Stores,
        },
    }
    if (!form || (Object.entries(form.formData.pages).length <= 0 && Object.entries(form.formData.stores).length <= 0)) {
        return useHttpEnd(event, {
            statusCode: Status.badRequest,
            body: "No form data or store data provided"
        }, Status.badRequest)
    }

    const formUlid = await createForm({
        name: form.name,
        description: form.description,
        pages: form.formData.pages,
        price: {
            individual: form.payment.amount,
            group: {
                amount: form.payment.group_amount,
                limit: form.payment.group_limit
            }
        },
        userUlid: details.user.ulid,
        allowGroups: form.allowGroups
    }).catch(err => err as Error)
    if (formUlid instanceof Error) {
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: formUlid?.message || "Unknown error while creating form"
        } as APIResponse<string>, Status.internalServerError)
    }

    const storeResult = await createStore(formUlid, form.formData.stores).catch(err => err as Error)
    if (storeResult instanceof Error) {
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: storeResult?.message || "Unknown error while creating form store"
        } as APIResponse<string>, Status.internalServerError)
    }

    const response = {} as APIResponse<string>
    response.statusCode = Status.created
    response.body = formUlid

    return response
}))


router.post("/update/:formUlid", defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const form = await readBody(event) as {
        name: string,
        description: string,
        payment: {
            amount: number,
        },
        formData: {
            pages: Forms,
            stores: Stores,
        }
    }

    if (!form || (Object.entries(form.formData.pages).length <= 0 && Object.entries(form.formData.stores).length <= 0)) {
        return useHttpEnd(event, {
            statusCode: Status.badRequest,
            body: "No form data or store data provided"
        }, Status.badRequest)
    }

    const err = await updateForm(formUlid, form.name, form.description, form.payment.amount, form.formData.pages).catch(err => err as Error)
    if (err instanceof Error) {
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err?.message || "Unknown error while updating form"
        } as APIResponse<string>, Status.internalServerError)
    }

    const storeResult = await updateStore(formUlid, form.formData.stores).catch(err => err as Error)
    if (storeResult instanceof Error) {
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: storeResult?.message || "Unknown error while updating form store"
        } as APIResponse<string>, Status.internalServerError)
    }

    const response = {} as APIResponse<string>
    response.statusCode = Status.success
    response.body = formUlid

    return response
}))

router.delete("/delete/:formUlid", defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) {
        return createError({
            status: 400,
            message: "No formUlid provided"
        })
    }

    const [user, error] = await useAuth(event)
    if (!user || error) {
        return createError({
            statusCode: 403,
            message: error || "Error getting user"
        })
    }

    const result = await deleteUserForm(user.user.ulid, formUlid).catch((e: Error) => e)
    if (result instanceof Error) {
        return createError({
            status: 500,
            data: result,
            message: result.message
        })
    }

    return createResponse({
        statusCode: 200,
        statusMessage: "OK"
    })
}))

router.post("/credit/:formUlid", defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const sendToPayload = await readBody(event) as CreditMethod
    if (!sendToPayload) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No phone number provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const form = await getFormByUlid(formUlid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form?.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if (form.forms?.userUlid !== details.user.ulid) return useHttpEnd(event, {
        statusCode: Status.forbidden,
        body: "Unauthorized"
    }, Status.forbidden)

    const result = await withdrawFunds({ formUlid, creditMethod: sendToPayload, reason: "User Initiated Form Withdrawal", requester: details.user.ulid }).catch(err => err as Error)
    if (result instanceof Error) {
        console.error(result)
        console.trace(result)
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: result?.message || "Unknown error while withdrawing funds"
        } as APIResponse<string>, Status.internalServerError)
    }

    const response = {} as APIResponse<string>
    response.statusCode = Status.success
    response.body = "Funds withdrawn"

    return response
}))


router.get("/submissions/:formUlid/total", defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const form = await getFormByUlid(formUlid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form?.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if (form.forms.userUlid !== details.user.ulid) return useHttpEnd(event, {
        statusCode: Status.forbidden,
        body: "Unauthorized"
    }, Status.forbidden)

    const total = await getFormPaymentsSum(formUlid).catch(err => err as Error)
    if (total instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: total?.message || "Unknown error while getting form payments total"
    } as APIResponse<string>, Status.internalServerError)

    const response = {} as APIResponse<number>
    response.statusCode = Status.success
    response.body = total

    return response
}))

router.get('/me', defineEventHandler(async event => {
    const response = {} as APIResponse<Array<{ forms: Drizzle.Form.select, stores: Drizzle.Store.select }>>
    const [details, error] = await useAuth(event)
    if (!details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    }, Status.unauthorized)

    const forms = await getFormsByUser(details.user.ulid).catch(err => err as Error)
    if (forms instanceof Error) {
        return useHttpEnd(event, {
            body: forms.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    }

    response.statusCode = Status.success
    response.body = forms as any
    return response
}))

router.get("/me/stats", defineEventHandler(async event => {
    const response = {} as APIResponse<{ forms: number, responses: number, earnings: number }>
    const [details, error] = await useAuth(event)
    if (!details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    }, Status.unauthorized)

    const stats = await getStats(details.user.ulid).catch(err => err as Error)
    if (stats instanceof Error) {
        return useHttpEnd(event, {
            body: stats.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    }

    response.statusCode = Status.success
    response.body = stats

    return response
}))


router.post('/submit/:formUlid', defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)
    const _data = await readBody(event) as {
        forms: Drizzle.Form.select & { pages: Forms },
        stores: Stores,
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

    const creator = await getUserByUlId(data.forms.userUlid).catch(err => err as Error)
    if (!creator) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: "Form Creaator Not Found"
    } as APIResponse<string>, Status.internalServerError)
    if (creator instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: creator.message || "Unknown error while getting form creator"
    } as APIResponse<string>, Status.internalServerError)

    async function insert(creator: Drizzle.User.select, data: {
        forms: Drizzle.Form.select;
        stores?: Drizzle.Store.select;
    }) {
        let formMail;
        for (const key in _data.forms.pages) {
            for (const field of _data.forms.pages[key] || []) {
                if (field.type === "email") {
                    formMail = field.value as string | undefined
                    break
                }
            }
        }
        await insertData(formUlid!, _data)
        sendUserMail({ email: creator?.email || formMail }, `New response on form ${data.forms.formName}`, `Update on form: ${data.forms.formName}`)
        if (details?.user) {
            sendUserMail({ email: details.user.email }, `Form submission successful for ${data.forms.formName}`, `You have successfully submitted form: ${data.forms.formName}`)
        }

        const response = {} as APIResponse<string>
        response.statusCode = Status.success
        response.body = "Form submitted"

        return response
    }

    const [details, error] = await useAuth(event)
    if (needsPay && !_data.token) {
        if (_data.forms.price_individual < data.forms.price_individual) {
            return useHttpEnd(event, {
                statusCode: 400,
                body: "Passed price is less than the allowed minimum for this form"
            })
        }
        return await processFormPayments(data.forms,
            { phone: _data.phone, amount: _data.forms.price_individual },
            creator?.email || creator?.name || "Unknown", () => {
                insertData(formUlid, _data, _data.forms.price_individual).catch(log.error)
                sendUserMail({ email: creator?.email }, `${_data.phone} has paid KES: ${_data.forms.price_individual}.00 for your form ${data.forms.formName}`, `Update on form: ${data.forms.formName}`)
                let formMail;
                for (const key in _data.forms.pages) {
                    for (const field of _data.forms.pages[key] || []) {
                        if (field.type === "email") {
                            formMail = field.value as string | undefined
                            break
                        }
                    }
                }
                if (details?.user || formMail) {
                    sendUserMail({ email: details?.user.email || formMail }, `Payment successful for ${data.forms.formName}`, `You have successfully paid for form: ${data.forms.formName}`)
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

        invalidatePrepaidFormLink(token.token)
        return insert(creator, data)
    } else {
        return insert(creator, data)
    }
}))

router.post('/invite/:formUlid', defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) {
        return createError({
            message: "No form ulid provided",
            status: 400
        })
    }

    const schema = z.object({
        invites: z.array(z.union([
            z.object({ email: z.string() }),
            z.object({ phone: z.string() })
        ])),
        phone: z.string(),
        origin: z.string(),
        group_name: z.string()
    })

    const { data, error } = await readValidatedBody(event, schema.safeParse)
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
    const [form, needsPay] = await needsIndividualPayment(db_form, amount)
    if (needsPay) {
        const creator = await getUserByUlId(db_form.forms.userUlid).catch(err => err as Error)
        if (creator instanceof Error) return createError({
            status: 404,
            message: "Form creator not found"
        })
        return await processFormPayments(db_form.forms, { phone: data.phone, amount: amount }, creator?.email || creator?.name || "Unknown", async (payment) => {
            const links = (await generateFormLinkTokens({
                form: form,
                formPaymentulid: payment
            }, data.invites.length)).map(bud => `${data.origin}/forms/${form.forms.ulid}?token=${bud}`)

            const message = "Hello, you have been invited to participate in the following survery. This is a paid link that is unique to you, and can only be used once. Follow it to submit your details: "
            sendResponseInvites(data.invites, links, message)
            sendUserMail({ email: creator?.email }, `New group payment for form: Group ${data.group_name} has paid for form: ${form.forms.formName} was processesed successfully`, `Group Paid on form: ${form.forms.formName}`)
        })
    } else {
        const links = (await generateFormLinkTokens({
            form: form
        }, data.invites.length)).map(bud => `${data.origin}/forms/${form.forms.ulid}?token=${bud}`)
        const message = "Hello, you have been invited to participate in the following survery. Follow the link to submit your details: "
        sendResponseInvites(data.invites, links, message)
        return {
            statusCode: 204,
            body: "OK"
        }
    }
}))

router.get('/submissions/:formUlid', defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const submissions = await getFormResponses(formUlid).catch(err => err as Error)
    if (submissions instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: submissions.message || "Unknown error while getting form submissions"
    }, Status.internalServerError)

    const response = {} as APIResponse<typeof submissions>
    response.statusCode = Status.success
    response.body = submissions

    return response
}))

router.get('/submissions/:formUlid/excel', defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const submissions = await getFormResponses(formUlid).catch(err => err as Error)
    if (submissions instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: submissions.message || "Unknown error while getting form submissions"
    }, Status.internalServerError)

    const excel = await constructExcel(submissions as any, details.user).catch(err => err as Error)
    if (excel instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: excel.message || "Unknown error while constructing excel"
    }, Status.internalServerError)

    return new Response(await excel.writeBuffer(), {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=${formUlid}.xlsx`
        }
    })
}))

export default useController('forms', router)
