"use client";

import { useEffect } from "react";
import { captureRef } from "@/lib/referral";

/** Remembers a partner link's ?ref= code (lib/referral.ts). Renders nothing. */
export default function RefCapture() {
  useEffect(() => captureRef(), []);
  return null;
}
