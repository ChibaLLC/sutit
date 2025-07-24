export default defineStore("auth", () => {
  const cookie = useCookie<string | undefined>("auth");
  const user = useCurrentUser();

  /**
   * This function sets the auth cookie
   *
   * @param token the string value of the token34
   * @param expiry the expiry time in seconds
   * @example
   * setAuthCookie("token", 3600)
   */
  function setAuthCookie(token: string | undefined | null) {
    if (Boolish(token)) {
      // @ts-expect-error
      cookie.value = token;
    } else {
      cookie.value = undefined;
    }
  }

  async function logout() {
    await $fetch("/api/auth/logout", {
      async onResponse() {
        cookie.value = undefined;
        user.value = undefined;
        await navigateTo("/auth/login");
      },
    }).catch(console.error);
  }

  return {
    logout,
    setAuthCookie,
    cookie,
    user,
  };
});
