import type { Forms, Stores } from "@chiballc/nuxt-form-builder"
import { createForm, createStore } from "./utils/queries"

export default defineEventHandler(async event => {
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
        requireMerch: boolean
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
        requireMerch: form.requireMerch,
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
})