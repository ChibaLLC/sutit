import { RealTime } from "./socket"
import consola from "consola"

export function isAPIResponse(data: any): data is APIResponse {
    for (const key in data) {
        if (!["statusCode", "body"].includes(key)) log.warn(`Unexpected key ${key} in APIResponse object`)
    }
    return data?.statusCode || (data?.statusCode && data?.body)
}

function hasPrice(form: ReconstructedDbForm): boolean {
	return form.form_meta.price_individual > 0;
}

export async function ResolveMpesaPayment(
	response: APIResponse,
	data: ReconstructedDbForm,
	loading: Ref,
	rerender: Ref,
	complete?: Ref
) {
	const realtime = new RealTime();
	if (response.statusCode <= 299) {
		if (!hasPrice(data) || useRoute().query?.token) {
			loading.value = true;
			rerender.value = false;
			window.alertSuccess("Form submitted successfully", { timeout: "never" });
			realtime?.close();
			setTimeout(() => {
				navigateTo(`/`);
			});
			return;
		}

		const channelName = createChannelName(response.body.checkoutRequestID, response.body.merchantRequestID);
		realtime!.subscribe(channelName);
		alert(
			"Form submitted for processing." + hasPrice(data)
				? "Please complete payment via the pop up on your phone"
				: ""
		);
		realtime!.on("error", (error) => {
			console.error(error);
		});

		realtime?.on("data", async (_data: any) => {
			const { data } = parseData(_data);
			if (data?.channel !== channelName) return console.warn("Invalid channel", data);
			const result = ParseRealTimePaymentData(data, loading, rerender, complete);
			if (result !== "not done") realtime?.close();
		});
	} else {
		window.alertError("Form submission failed: " + response.body);
		rerender.value = true;
	}
}


function ParseRealTimePaymentData(data: SocketTemplate, loading: Ref, rerender: Ref, complete?: Ref) {
    switch (data.type) {
        case TYPE.SUCCESS:
            loading.value = true
            rerender.value = false
            window.alertSuccess('Form submitted successfully', { timeout: 'never' })
            setTimeout(() => {
                navigateTo(`/`)
            }, 1000)
            return 'done'
        case TYPE.ERROR:
            switch (data.statusCode) {
                case Status.badRequest:
                    log.error(data.body)
                    rerender.value = true
                    loading.value = false
                    if (complete) complete.value = false
                    return 'error'
                case Status.internalServerError:
                    log.error(data)
                    rerender.value = true
                    loading.value = false
                    if (complete) complete.value = false
                    return 'error'
                case Status.unprocessableEntity:
                    window.alertError(data.body)
                    rerender.value = true
                    loading.value = false
                    if (complete) complete.value = false
                    return 'error'
                default:
                    return 'error'
            }
        default:
            rerender.value = true
            loading.value = false
            if (complete) complete.value = false
            return 'not done'
    }
}


function isClientValidationError(data: any): data is ValidationError {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data)
        } catch {
            return false
        }
    }
    return data && typeof data === 'object' && 'message' in data && 'path' in data
}

export interface ValidationError {
    validation?: string;
    code: string;
    message: string;
    path: string[];
    minimum?: number;
    type?: string;
    inclusive?: boolean;
    exact?: boolean;
}

function formatValidationErrorArray(errorArray: ValidationError[]): string[] {
    return errorArray.map(error => {
        const field = error.path.join(".");
        const message = error.message;

        return `Error in "${field}": ${message}`;
    });
}

function formatErrors(data: any[]) {
    const validationErrors = [] as ValidationError[]
    const rest = [] as any[]
    data.forEach(datum => {
        if (isClientValidationError(datum)) {
            validationErrors.push(datum)
        } else {
            rest.push(datum)
        }
    })
    const join = formatValidationErrorArray(validationErrors).join("/n")
    return `${join}/n${rest.join("/")}`
}

function formatErrorMessage(message: any) {
    if (typeof message === 'string') {
        try {
            var data = JSON.parse(message)
        } catch {
            return String(message)
        }
    }
    if (Array.isArray(data)) {
        return formatErrors(data)
    } else if (isClientValidationError(data)) {
        const field = data.path.join(".");
        const message = data.message;

        return `Error in "${field}": ${message}`;
    }

    return JSON.stringify(data)
}

export function unWrapFetchError(response: Response & { _data: any } | any, html?: true | 'none') {
    let message = "Unknown error occurred";
    if (response?._data) {
        if (response._data?.message || response?._data?.body) {
            message = formatErrorMessage(response._data?.message || response._data?.body || response?._data.statusText || response.statusText);
        } else if (response._data.detail) {
            message = formatErrorMessage(response._data.detail);
        }
    } else if (response?.message) {
        message = formatErrorMessage(response.message || response.statusMessage);
    } else {
        try {
            var data = response?._data ? JSON.parse(response._data) : JSON.parse(response);
        } catch {
            if (response?._data) {
                return String(response._data)
            }
            return String(message)
        }

        message = formatErrorMessage(data);
    }

    if (html) {
        if (html === 'none') return message.replace("/n", " ")
        return message.replace("/n", "<br>")
    }

    return message;
}
