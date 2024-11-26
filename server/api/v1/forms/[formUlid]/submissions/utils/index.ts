import type {Drizzle} from "~~/server/db/types";
import type {FormElementData} from "@chiballc/nuxt-form-builder";
import excel from "exceljs";
import {getFormByUlid} from "~~/server/api/v1/forms/utils/queries";

type Entries = {
    stores: {
        ulid: string;
        createdAt: string;
        updatedAt: string;
        formUlid: string;
        store: unknown;
    } | null;
    form_responses: {
        price: number | null;
        createdAt: string;
        updatedAt: string;
        formUlid: string;
        response: unknown;
        id: number;
    };
}
export async function constructExcel(data: Entries[], user: Drizzle.User.select) {
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
    if (data.length === 0) return workbook.xlsx

    const forms = await getFormByUlid(data.at(0)!.form_responses.formUlid).catch(err => err as Error)
    if (forms instanceof Error) return workbook.xlsx

    const form = forms!.forms
    const hasPayment = form.price_individual !== 0 || Object.values(forms?.stores.store || {}).some(store => (store as Array<any>).some((item: any) => item.price !== 0)) || form.price_group_amount !== 0
    const worksheet = workbook.addWorksheet(form.formName)

    const titles: string[] = getFields(form.pages as Record<string, FormElementData[]>).map(field => field.label)
    if (hasPayment) titles.push("Price")
    worksheet.addRow(titles).font = { bold: true }

    const responses = (response: Entries[]) => {
        if (!response) return {} as {
            meta: Entries;
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

    responses(data).forEach(response => {
        const values: string[] = getFields(response.response as Record<string, FormElementData[]>).map(field => field.value)
        if (hasPayment) {
            // @ts-ignore
            values.push(response.meta?.price?.toString() || "UNRECORDED")
        }
        worksheet.addRow(values)
    })

    return workbook.xlsx
}