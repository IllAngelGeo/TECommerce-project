"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FlyonuiScript() {
  const pathname = usePathname();

  useEffect(() => {
    async function initFlyonUI() {
      await import("flyonui/flyonui");

      console.log("✅ FlyonUI importado");
      console.log(window.HSStaticMethods);

      window.HSStaticMethods?.autoInit();
    }

    initFlyonUI();
  }, [pathname]);

  return null;
}