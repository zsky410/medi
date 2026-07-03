"use client";

import { use } from "react";
import ShopGuidePage from "./shop-guide-client";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ShopGuidePage id={id} />;
}
