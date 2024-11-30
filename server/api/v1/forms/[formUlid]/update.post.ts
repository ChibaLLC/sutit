import {updateForm, updateStore} from "../utils/queries";
import type {Forms, Stores} from "@chiballc/nuxt-form-builder"

export default defineEventHandler(async event => {
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
        allowGroups: boolean
        payment: {
            amount: number,
            group_amount?: number,
            group_limit?: number,
            group_message: string
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

    const err = await updateForm(formUlid, {
        name: form.name,
        description: form.description,
        pages: form.formData.pages,
        price: {
            individual: form.payment.amount,
            group: {
                amount: form.payment.group_amount,
                limit: form.payment.group_limit,
                message: form.payment.group_message,
            }
        },
        requireMerch: form.requireMerch,
        userUlid: details.user.ulid,
        allowGroups: form.allowGroups
    }).catch(err => err as Error)
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
})