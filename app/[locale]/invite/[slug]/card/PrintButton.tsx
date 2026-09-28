"use client";

import { Printer } from "lucide-react";
import s from "./card.module.css";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={s.print}>
      <Printer size={15} aria-hidden />
      {label}
    </button>
  );
}
