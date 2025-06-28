export function useRedirect(target: string, base?: string): string;
export function useRedirect(): string | null;
export default function useRedirect(target?: string, base?: string) {
  const redirect = useRouteQuery("redirect").value;
  if (!target) {
    if (!redirect) return null;
    return redirect;
  }

  if (!base) {
    const route = useRoute();
    base = route.path;
  }

  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }

  if (!target.startsWith("/")) {
    target = `/${target}`;
  }

  return base + target;
}
