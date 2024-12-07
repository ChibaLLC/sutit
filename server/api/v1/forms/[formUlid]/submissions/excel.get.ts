import {getFormResponses} from "./utils/queries";
import {constructExcel} from "./utils";

export default  defineEventHandler(async event => {
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

    const excel = await constructExcel(submissions, details.user).catch(err => err as Error)
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
})