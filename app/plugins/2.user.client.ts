export default defineNuxtPlugin(async () => {
	const token = getAuthCookie();
	if (!token) return;

	const user = await useUser();
	if (user.value && user.value?.token === token) return;

	const { data } = await useFetch(`/api/v1/users/me`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		async onResponseError({ response }) {
			const res = response._data;
			if (res.statusCode === 200) {
				user.value = res.body;
				return;
			} else {
				setAuthCookie(undefined);
				user.value = {} as UserState;
			}
		},
	});

	if (data.value) {
		user.value = data.value;
	} else {
		setAuthCookie(undefined);
		user.value = {} as UserState;
	}
});
