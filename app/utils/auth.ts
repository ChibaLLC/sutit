/**
 * This function sets the auth cookie
 *
 * @param token the string value of the token34
 * @param expiry the expiry time in seconds
 * @example
 * setAuthCookie("token", 3600)
 */
export function setAuthCookie(token: string | undefined | null, expiry?: number) {
    if (Boolish(token)) {
        const expires = expiry ? new Date(Date.now() + expiry * 1000) : undefined
        const cookie = useCookie<string>("auth", {
            expires: expires
        })
        cookie.value = token!
    } else {
        useCookie('auth').value = undefined
    }
}


/**
 * Gets the user authentication cookie, labeled as `auth`
 *
 * @returns cookie
 */
export function getAuthCookie(): string | null {
    const cookie = useCookie<string>("auth").value
    if (!Boolish(cookie)) return null
    return cookie
}

export function getAuthToken() {
    return getAuthCookie()
}

export function userIsAuthenticated() {
    return !!getAuthToken()
}

export async function logout() {
    await $fetch("/api/auth/logout", {
		async onResponse({ response }) {
			const {user} = await useUser();
			user.value = {} as UserState;
			setAuthCookie(undefined);
			await navigateTo("/auth/login");
		},
	}).catch(console.error);
}