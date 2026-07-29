export const HYDRATION_EXTENSION_ATTRIBUTES = ["bis_skin_checked"] as const;

export function createHydrationExtensionCleanupScript(): string {
  const attributes = JSON.stringify(HYDRATION_EXTENSION_ATTRIBUTES);

  return `(()=>{try{const a=${attributes};for(const n of a){document.querySelectorAll("["+n+"]").forEach((e)=>e.removeAttribute(n));}}catch{}})();`;
}
