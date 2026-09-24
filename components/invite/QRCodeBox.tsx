"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";

export default function QRCodeBox({
  url,
  fileName,
  accentColor,
}: {
  url: string;
  fileName: string;
  accentColor: string;
}) {
  const t = useTranslations("invite.qr");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      color: { dark: "#111111", light: "#ffffffff" },
    })
      .then((d) => {
        if (!cancelled) setDataUrl(d);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!dataUrl) {
    return (
      <div className="flex h-40 w-40 animate-pulse items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
        {t("generating")}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt={t("alt")}
        className="h-40 w-40 rounded-lg border border-neutral-200 p-2"
      />
      <a
        href={dataUrl}
        download={fileName}
        style={{ color: accentColor }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
      >
        <Download size={14} />
        {t("download")}
      </a>
    </div>
  );
}
