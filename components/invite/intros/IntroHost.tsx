"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { IntroId } from "@/lib/templates";
import { getFontPairing } from "@/lib/fontPairings";
import ParticleField, {
  type BurstOptions,
  type ParticleFieldHandle,
} from "../particles/ParticleField";
import { INTROS } from "./registry";
import { INTRO_DONE_EVENT, INTRO_OPENED_EVENT, REPLAY_INTRO_EVENT } from "./events";
import { scrollParent, usePaneHeight } from "../motion/scroll";
import s from "./intro.module.css";

/**
 * Plays a template's intro (chosen from the registry by id) and owns
 * everything around it, so each intro only has to animate its own scene:
 *
 * - Public page: covers the window, locks page scroll until the guest opens
 *   it, and skips it for a guest who already opened it this session. The
 *   server renders the closed intro, so the invitation never flashes first.
 * - Editor preview (`preview`): contained to the preview pane — sticky at
 *   the top of the pane at the pane's height — always plays, never locks
 *   scroll, never plays audio.
 * - Both: a particle canvas that outlives the intro (so a burst can keep
 *   falling after it's gone), and replay via REPLAY_INTRO_EVENT.
 */
export default function IntroHost({
  introId,
  templateId,
  slug,
  preview,
  weddingDate,
  brideName,
  groomName,
  singlePerson,
  accentColor,
  fontPairing,
}: {
  introId: IntroId;
  templateId: string;
  slug: string;
  preview: boolean;
  weddingDate: string;
  brideName: string;
  groomName: string;
  singlePerson: boolean;
  accentColor: string;
  fontPairing: string;
}) {
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false); // guest has acted
  const [gone, setGone] = useState(false); // intro finished and removed
  const [run, setRun] = useState(0); // bumps on replay to remount the intro
  const layerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleFieldHandle>(null);
  const paneHeight = usePaneHeight(layerRef, preview);
  const storageKey = `envelope-opened:${slug}`;

  // Public: skip for a guest who already opened it this session. Deferred
  // past hydration so the server-rendered closed state always matches.
  useEffect(() => {
    if (preview) return;
    const id = setTimeout(() => {
      try {
        if (sessionStorage.getItem(storageKey)) {
          setOpen(true);
          setGone(true);
          window.dispatchEvent(new Event(INTRO_DONE_EVENT));
        }
      } catch {
        // sessionStorage unavailable — show the intro every time, harmless.
      }
    }, 0);
    return () => clearTimeout(id);
  }, [preview, storageKey]);

  // Public: no page scroll behind the intro until the guest opens it.
  useEffect(() => {
    if (preview) return;
    document.body.style.overflow = open ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, preview]);

  useEffect(() => {
    const replay = () => {
      const pane = preview ? scrollParent(layerRef.current) : null;
      if (pane) pane.scrollTo({ top: 0 });
      else window.scrollTo({ top: 0 });
      particlesRef.current?.clear();
      setOpen(false);
      setGone(false);
      setRun((n) => n + 1);
    };
    window.addEventListener(REPLAY_INTRO_EVENT, replay);
    return () => window.removeEventListener(REPLAY_INTRO_EVENT, replay);
  }, [preview]);

  const onOpen = useCallback(() => {
    setOpen(true);
    if (preview) return;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore — worst case the intro plays again on the next load.
    }
    window.dispatchEvent(new Event(INTRO_OPENED_EVENT));
  }, [preview, storageKey]);

  const onDone = useCallback(() => {
    setGone(true);
    window.dispatchEvent(new Event(INTRO_DONE_EVENT));
  }, []);
  const burst = useCallback((opts: BurstOptions) => particlesRef.current?.burst(opts), []);

  const Intro = INTROS[introId];
  const font = getFontPairing(fontPairing);
  // Always day · month · year (the ISO date reversed), whatever the locale.
  const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(weddingDate)
    ? weddingDate.split("-").reverse().join(" · ")
    : "";

  return (
    <div ref={layerRef} className={preview ? s.paneLayer : s.fixedLayer}>
      <div className={s.frame} style={preview && paneHeight ? { height: paneHeight } : undefined}>
        {!gone && (
          <div className={s.slot}>
            <Intro
              key={run}
              names={{
                a: brideName || (singlePerson ? tCommon("youFallback") : tCommon("brideFallback")),
                b: singlePerson ? undefined : groomName || tCommon("groomFallback"),
              }}
              weddingDate={weddingDate}
              dateLabel={dateLabel}
              fonts={{ display: font.headingVar, script: font.headingVar, caps: font.bodyVar }}
              accent={accentColor}
              templateId={templateId}
              onOpen={onOpen}
              onDone={onDone}
              burst={burst}
              preview={preview}
            />
          </div>
        )}
        <ParticleField ref={particlesRef} preset="marigold" mode="burst" className={s.particles} />
      </div>
    </div>
  );
}
