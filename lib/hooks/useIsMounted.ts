import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * Returns false during SSR and the very first client render, true thereafter.
 * Useful for deferring localStorage-driven UI to avoid an empty-state flash.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, onClient, onServer);
}
