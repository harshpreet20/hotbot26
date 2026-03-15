"use client";

import type { AdSlot as AdSlotType } from "@/types/blog";
import { InlineAdBanner } from "./InlineAdBanner";

interface Props {
  slot: AdSlotType;
}

export function AdSlot({ slot }: Props) {
  if (slot.type === "contextual") {
    return <InlineAdBanner topic={slot.topic ?? "general"} />;
  }

  // Custom code ad — render raw HTML/script sandboxed in an iframe-like wrapper
  if (!slot.code?.trim()) return null;
  return (
    <div
      className="my-6"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: slot.code }}
    />
  );
}
