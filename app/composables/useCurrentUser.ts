const USER = "user" as const;

export async function getCurrentUser() {
  const { data } = await useAsyncState(USER, async () => {
    const cookie = useCookie("auth");
    if (!cookie.value) return undefined;

    const user = await $fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${cookie.value}`,
      },
    }).catch((e) => {
      log.error(e);
      cookie.value = undefined;
      return undefined;
    });

    return user;
  });

  return data.value;
}

export default function () {
  const user = useState<Awaited<ReturnType<typeof getCurrentUser>>>(USER);
  if (!user.value) {
    getCurrentUser().then((data) => {
      user.value = data;
    });
  }

  return user;
}
