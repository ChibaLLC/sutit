import {type APIResponse, Status} from "~/types";
import {
    createForm,
    getFormByUlid,
    getFormResponses,
    getFormsByUser,
    hasPaid,
    insertData
} from "~/mvc/forms/queries";
import type {Drizzle} from "~/db/types";
import {getUserByUlId} from "~/mvc/users/queries";
import {processFormPayments} from "~/mvc/forms/methods";

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

    const response = {} as APIResponse<Drizzle.Form.select>
    response.statusCode = Status.success
    response.body = form

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
        payment: {
            amount: number,
        },
        formData: {
            pages: Record<string, Array<any>>,
            stores: Record<string, Array<any>>,
        }
    }
    if (!form || (Object.entries(form.formData.pages).length <= 0 && Object.entries(form.formData.stores).length <= 0)) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form data or store data provided"
    }, Status.badRequest)

    const formId = await createForm(form.name, form.description, form.payment.amount, details.user.ulid, form.formData.pages).catch(err => err as Error)
    if (formId instanceof Error) {
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: formId?.message || "Unknown error while creating form"
        } as APIResponse<string>, Status.internalServerError)
    }

    const response = {} as APIResponse<string>
    response.statusCode = Status.success
    response.body = "Form created"

    return response
}))


router.get('/me', defineEventHandler(async event => {
    const response = {} as APIResponse<Drizzle.Form.select[]>
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
    response.body = forms
    return response
}))


router.post('/submit/:formUlid', defineEventHandler(async event => {
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

    const data = await readBody(event) as Array<{
        label: string,
        value: any
    }>
    if (!data || data?.length == 0) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No data provided"
    }, Status.badRequest)

    const form = await getFormByUlid(formUlid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    await insertData(details.user.ulid, form, data).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while submitting form"
        } as APIResponse<string>, Status.internalServerError)
    })

    const response = {} as APIResponse<string>
    response.statusCode = Status.success
    response.body = "Form submitted"

    return response
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

    const response = {} as APIResponse<Drizzle.Responses.select[]>
    response.statusCode = Status.success
    response.body = submissions

    return response
}))


router.post('/pay/:formUlid', defineEventHandler(async event => {
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

    const form = await getFormByUlid(formUlid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form?.message || "Unknown error while getting form"
    }, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if (await hasPaid(form.ulid, details.phone)) {
        return useHttpEnd(event, {
            statusCode: Status.success,
            body: "Payment already made"
        }, Status.success)
    }

    const user = await getUserByUlId(form.userUlid).catch(err => err as Error)
    if (user instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: user?.message || "Unknown error while getting user"
    }, Status.internalServerError)
    if (!user) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "User not found"
    }, Status.notFound)


    await processFormPayments(event, form, {identity: details.identity, phone: details.phone}, user.email)
}))

export default useController('forms', router)