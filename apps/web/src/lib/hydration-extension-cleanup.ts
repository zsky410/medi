export const HYDRATION_EXTENSION_ATTRIBUTES = ["bis_skin_checked"] as const;

export function createHydrationExtensionCleanupScript(): string {
  const attributes = JSON.stringify(HYDRATION_EXTENSION_ATTRIBUTES);

  return `(()=>{try{const a=${attributes};const c=(r=document)=>{for(const n of a){if(r.nodeType===1&&r.hasAttribute?.(n))r.removeAttribute(n);r.querySelectorAll?.("["+n+"]").forEach((e)=>e.removeAttribute(n));}};c();if(typeof MutationObserver==="function"){const o=new MutationObserver((m)=>{for(const x of m){if(x.type==="attributes"&&a.includes(x.attributeName))c(x.target);x.addedNodes?.forEach(c);}});o.observe(document.documentElement,{attributes:true,childList:true,subtree:true,attributeFilter:a});setTimeout(()=>o.disconnect(),5000);}}catch{}})();`;
}
