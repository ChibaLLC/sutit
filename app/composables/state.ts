export const useUser = () =>
	useAsyncState<UserState>("user", async () => {
		const token = getAuthCookie();
		if (!token) return {} as UserState;

		const user = await $fetch("/api/users/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			async onResponseError({ response }) {
				log.error(response);
				setAuthCookie(undefined);
				(await useUser()).value = {} as UserState;
			},
		});

		return user;
	});

// At some point this will fail with nuxt instance not found.
// There are known issues with composables.
export const useAsyncState = async <T>(
	key: string,
	fn: () => Promise<T>,
	options?: {
		errors?: Ref<Array<any>> | Array<any>;
	}
) => {
	const { data: initial } = useNuxtData(key);
	if (initial.value) return Promise.resolve(initial as Ref<T>);
	const { data: _new, error } = await useAsyncData<T>(key, fn);
	if (error && options?.errors) {
		log.error("An error occurred while fetching data for", key);
		log.error(error);
		if (options?.errors) {
			if (isRef(options.errors)) {
				options.errors.value.push(error);
			} else {
				options.errors.push(error);
			}
		}
	}
	return _new as Ref<T>;
};

export function useRedirect(target: string, base?: string): string;
export function useRedirect(): string | null;
export function useRedirect(target?: string, base?: string) {
	const route = useRoute();
	if (!target) {
		let redirect = route.query?.redirect;
		if (!redirect) return null;
		if (Array.isArray(redirect)) {
			redirect = redirect.filter(Boolean);
			return redirect.at(-1)?.toString();
		} else {
			return redirect;
		}
	}

	if (!base) base = route.path;

	if (base.endsWith("/")) base = base.slice(0, -1);
	if (!target.startsWith("/")) target = `/${target}`;

	return base + target;
}
