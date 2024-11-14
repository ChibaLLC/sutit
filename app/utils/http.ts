import type { Forms, Stores } from "@chiballc/nuxt-form-builder"
import { RealTime } from "./socket"
import consola from "consola"

export function isAPIResponse(data: any): data is APIResponse {
    for (const key in data) {
        if (!["statusCode", "body"].includes(key)) log.warn(`Unexpected key ${key} in APIResponse object`)
    }
    return data?.statusCode || (data?.statusCode && data?.body)
}


export type ServerForm = {
    forms: Omit<Drizzle.Form.select, 'pages'> & {
        pages: Forms
    },
    stores: Omit<Drizzle.Store.select, 'store'> & {
        store: Stores
    }
}

function hasPrice(form: Omit<Drizzle.Form.select, 'pages'> & { pages: Forms }): boolean {
    return form.price_individual > 0
}

export async function ResolveMpesaPayment(response: APIResponse, data: ServerForm, realtime: RealTime, loading: Ref, rerender: Ref, complete?: Ref) {
    if(!realtime) return consola.warn("RealTime not passed")
    if (response.statusCode <= 299) {
        if (!hasPrice(data.forms) || useRoute().query?.token) {
            loading.value = true
            rerender.value = false
            window.alertSuccess('Form submitted successfully', { timeout: 'never' })
            setTimeout(() => {
                navigateTo(`/`)
            })
            return
        }

        const channelName = createChannelName(response.body.checkoutRequestID, response.body.merchantRequestID)
        realtime!.subscribe(channelName)
        alert('Form submitted for processing.' + hasPrice(data.forms) ? 'Please complete payment via the pop up on your phone' : '')
        realtime!.on('error', (error) => {
            console.error(error)
        })

        realtime?.on("data", (_data: any) => {
            const { data } = parseData(_data)
            if (data?.channel !== channelName) return console.warn('Invalid channel', data)
            ParseRealTimePaymentData(data, loading, rerender, complete)
        })
    } else {
        window.alertError('Form submission failed: ' + response.body)
        rerender.value = true
    }
}


async function ParseRealTimePaymentData(data: SocketTemplate, loading: Ref, rerender: Ref, complete?: Ref) {
    switch (data.type) {
        case TYPE.SUCCESS:
            loading.value = true
            rerender.value = false
            window.alertSuccess('Form submitted successfully', { timeout: 'never' })
            setTimeout(() => {
                navigateTo(`/`)
            }, 1000)
            break
        case TYPE.ERROR:
            switch (data.statusCode) {
                case Status.badRequest:
                    log.error(data.body)
                    rerender.value = true
                    loading.value = false
                    if (complete) complete.value = false
                    break
                case Status.internalServerError:
                    log.error(data)
                    rerender.value = true
                    loading.value = false
                    if (complete) complete.value = false
                    break
                case Status.unprocessableEntity:
                    window.alertError(data.body)
                    rerender.value = true
                    loading.value = false
                    if (complete) complete.value = false
                    break
            }
        default:
            rerender.value = true
            loading.value = false
            if (complete) complete.value = false
    }
}
