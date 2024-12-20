import type { Drizzle } from "~~/server/db/types";
import type { FormElementData } from "@chiballc/nuxt-form-builder";
import { getFormResponses } from "./queries";
import excel from "exceljs";

function replaceSpecialChars(input: string): string {
    return input.replace(/[*?:\\/\[\]]/g, '_');
}

export async function constructExcel(data: Awaited<ReturnType<typeof getFormResponses>>, user: Drizzle.User.select) {
    function getFields(pages: Record<string, FormElementData[]>): FormElementData[] {
        return Object.values(pages || {}).reduce((acc, page) => {
            return acc.concat(page)
        }, [])
    }

    function isFormElementData(data: any): data is Record<string, FormElementData[]> {
        return !data.hasOwnProperty('pages')
    }

    const workbook = new excel.Workbook()
    workbook.creator = "Sutit Investment Limited"
    workbook.lastModifiedBy = user.name || "Unknown"
    workbook.created = new Date()

    const hasPayment = data.form.forms.price_individual !== 0 || Object.values(data.form.stores.store || {})
        .some(store => (store as Array<any>)
            .some((item: any) => item.price !== 0)) || data.form.forms.price_group_amount !== 0
    const worksheet = workbook.addWorksheet(replaceSpecialChars(data.form.forms.formName))

    const titles: string[] = getFields(data.form.forms.pages as Record<string, FormElementData[]>).map(field => field.label as string)
    if (hasPayment) titles.push("Price")
    worksheet.addRow(titles).font = { bold: true }

    const responses = (response: typeof data.form_responses) => {
        if (!response) return {} as {
            meta: typeof data.form.forms;
            response: Record<string, FormElementData[]> | undefined;
        }[]
        return response.map(entry => {
            if (isFormElementData(entry.form_responses.response)) {
                return {
                    meta: entry.form_responses,
                    response: entry.form_responses.response
                }
            } else {
                return {
                    meta: entry.form_responses,
                    // @ts-ignore
                    response: entry.form_responses.response!.pages
                }
            }
        })
    }

    responses(data.form_responses).forEach(response => {
        const values: string[] = getFields(response.response as Record<string, FormElementData[]>)
            .map(field => {
                if (field.type === "checkbox") {
                    field.value = Object.values(field.value || {})
                        .map(d => useCapitalize(d as string))
                        .join(", ")
                }
                return field.value
            })
        if (hasPayment) {
            // @ts-ignore
            values.push(response.meta?.price?.toString() || "UNRECORDED")
        }
        worksheet.addRow(values)
    })

    return workbook.xlsx
}