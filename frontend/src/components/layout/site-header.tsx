// src/components/layout/site-header.tsx
import React from "react";
import { TopBar } from "./TopBar";

export function SiteHeader() {
  return (
    // ensure the bar itself is above the scrollable region
    <div className="sticky top-0 z-20 bg-background border-b">
      <TopBar />
    </div>
  );
}
