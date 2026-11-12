"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nameFitScale, resolveMonogram } from "@/lib/monogram";
import type { MonogramInitials } from "@/lib/types";
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
 * - Both: the intro opens by itself. Guests found "tap to open" hard to
 *   use (and a missed tap felt like a stuck page), so after a moment on
 *   the cover the host presses the intro's own button for it — again for
 *   openings with several steps — and the animation plays unprompted.
 *   A guest's own tap still works. Sound waits for a real touch (browsers
 *   block it otherwise); the music starts on the guest's first touch.
 */
const AUTO_OPEN_AFTER_MS = 1100;
const AUTO_OPEN_EVERY_MS = 1000;
const AUTO_OPEN_TRIES = 12;
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
  monogram,
  greeting = "",
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
  monogram?: MonogramInitials;
  /** Guest name from a personal link, shown over the intro. */
  greeting?: string;
}) {
  const tCommon = useTranslations("common");
  const tGreeting = useTranslations("invite.greeting");
  const [open, setOpen] = useState(false); // guest has acted
  const [gone, setGone] = useState(false); // intro finished and removed
  const [run, setRun] = useState(0); // bumps on replay to remount the intro
  const layerRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
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

  // Open the intro without a tap (see above).
  useEffect(() => {
    if (open || gone) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const press = () => {
      slotRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.click();
      if (++tries < AUTO_OPEN_TRIES) timer = setTimeout(press, AUTO_OPEN_EVERY_MS);
    };
    timer = setTimeout(press, AUTO_OPEN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [open, gone, run]);

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
    // The music starts on this tap — in the editor preview too.
    window.dispatchEvent(new Event(INTRO_OPENED_EVENT));
    if (preview) return;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Ignore — worst case the intro plays again on the next load.
    }
  }, [preview, storageKey]);

  const onDone = useCallback(() => {
    setGone(true);
    window.dispatchEvent(new Event(INTRO_DONE_EVENT));
  }, []);
  const burst = useCallback((opts: BurstOptions) => particlesRef.current?.burst(opts), []);

  const Intro = INTROS[introId];
  const names = {
    a: brideName || (singlePerson ? tCommon("youFallback") : tCommon("brideFallback")),
    b: singlePerson ? undefined : groomName || tCommon("groomFallback"),
  };
  const font = getFontPairing(fontPairing);
  // Always day · month · year (the ISO date reversed), whatever the locale.
  const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(weddingDate)
    ? weddingDate.split("-").reverse().join(" · ")
    : "";

  return (
    <div ref={layerRef} className={preview ? s.paneLayer : s.fixedLayer}>
      <div className={s.frame} style={preview && paneHeight ? { height: paneHeight } : undefined}>
        {!gone && (
          <div
            ref={slotRef}
            className={s.slot}
            style={{ ["--name-fit" as string]: nameFitScale(names.a, names.b) }}
          >
            <Intro
              key={run}
              names={names}
              monogram={resolveMonogram(names.a, names.b ?? "", monogram, singlePerson)}
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
            {greeting && (
              <p className={s.greeting} style={{ fontFamily: font.headingVar }}>
                <span className={s.greetingName}>{tGreeting("dear", { name: greeting })}</span>
                <span className={s.greetingSub}>{tGreeting("sub")}</span>
              </p>
            )}
          </div>
        )}
        <ParticleField ref={particlesRef} preset="marigold" mode="burst" className={s.particles} />
      </div>
    </div>
  );
}
