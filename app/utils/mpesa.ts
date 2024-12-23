export function hasChannelData(response: any): response is {
	merchantRequestID: string;
	checkoutRequestID: string;
} {
	return hasOwnProperties<{
		merchantRequestID: string;
		checkoutRequestID: string;
	}>(response, ["checkoutRequestID", "merchantRequestID"]);
}

export async function ResolveMpesaPayment(
	meta: {
		merchantRequestID: string;
		checkoutRequestID: string;
	},
	loading: Ref,
	rerender: Ref,
	complete?: Ref
) {
	const realtime = new RealTime();
	const channelName = createChannelName(meta.checkoutRequestID, meta.merchantRequestID);

	realtime.subscribe(channelName);
	alert("Form submitted for processing. Please complete payment via the pop up on your phone");
	realtime.on("error", (error) => {
		console.error(error);
	});
	realtime.on("data", async (_data: any) => {
		const { data } = parseData(_data);
		if (data?.channel !== channelName) return console.warn("Invalid channel", data);
		const result = ParseRealTimePaymentData(data, loading, rerender, complete);
		if (result !== "not done") realtime?.close();
	});
}

function ParseRealTimePaymentData(data: SocketTemplate, loading: Ref, rerender: Ref, complete?: Ref) {
	switch (data.type) {
		case TYPE.SUCCESS:
			loading.value = true;
			rerender.value = false;
			window.alertSuccess("Form submitted successfully", { timeout: "never" });
			setTimeout(() => {
				navigateTo(`/`);
			}, 1000);
			return "done";
		case TYPE.ERROR:
			switch (data.statusCode) {
				case Status.badRequest:
					log.error(data.body);
					rerender.value = true;
					loading.value = false;
					if (complete) complete.value = false;
					return "error";
				case Status.internalServerError:
					log.error(data);
					rerender.value = true;
					loading.value = false;
					if (complete) complete.value = false;
					return "error";
				case Status.unprocessableEntity:
					window.alertError(data.body);
					rerender.value = true;
					loading.value = false;
					if (complete) complete.value = false;
					return "error";
				default:
					return "error";
			}
		default:
			rerender.value = true;
			loading.value = false;
			if (complete) complete.value = false;
			return "not done";
	}
}