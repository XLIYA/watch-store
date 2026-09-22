import { useSyncExternalStore } from "react";
const MOBILE_QUERY = "(max-width: 767px)";
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
// اندازهٔ viewport یک منبع بیرونی است؛ بدون setState در effect به آن مشترک می‌شویم.
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches, () => false);
}
