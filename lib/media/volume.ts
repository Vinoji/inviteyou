/**
 * Music volume that works on every device. Desktop and Android honour
 * `audio.volume`; iOS ignores it (the property stays at 1 and only the
 * hardware buttons change loudness), so there the element is routed
 * through a Web Audio gain node instead — only for songs served from this
 * site: a cross-origin file routed that way plays silent unless its server
 * sends CORS headers, which our Firebase Storage bucket doesn't. So on iOS
 * AudioToggle plays uploaded songs through the same-origin /api/media proxy
 * (lib/media/viaSite).
 */
export const DEFAULT_MUSIC_VOLUME = 0.25;

let locked: boolean | null = null;
/** True where a page can't change an <audio> element's volume (iOS). */
export function volumeLocked(): boolean {
  if (locked === null) {
    const probe = document.createElement("audio");
    probe.volume = 0.5;
    locked = probe.volume !== 0.5;
  }
  return locked;
}

const graphs = new WeakMap<HTMLMediaElement, { ctx: AudioContext; gain: GainNode }>();

/**
 * Sets the element's loudness (0–1). Call it with `fromGesture` inside a
 * tap or key press before playing: on iOS that's when the audio graph can
 * be created and resumed.
 */
export function setMusicVolume(audio: HTMLMediaElement, volume: number, fromGesture = false) {
  if (!volumeLocked()) {
    audio.volume = volume;
    return;
  }
  let graph = graphs.get(audio);
  if (!graph && fromGesture) {
    if (new URL(audio.currentSrc || audio.src, location.href).origin !== location.origin) return;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const gain = ctx.createGain();
      ctx.createMediaElementSource(audio).connect(gain);
      gain.connect(ctx.destination);
      graph = { ctx, gain };
      graphs.set(audio, graph);
    } catch {
      return; // Falls back to the device volume.
    }
  }
  if (!graph) return;
  graph.gain.gain.value = volume;
  if (graph.ctx.state === "suspended") void graph.ctx.resume();
}

const KEY = "namma:invite-music-volume";
export function savedMusicVolume(): number {
  if (typeof window === "undefined") return DEFAULT_MUSIC_VOLUME;
  try {
    const v = Number(localStorage.getItem(KEY));
    return v > 0 && v <= 1 ? v : DEFAULT_MUSIC_VOLUME;
  } catch {
    return DEFAULT_MUSIC_VOLUME;
  }
}
export function saveMusicVolume(v: number) {
  try {
    localStorage.setItem(KEY, String(v));
  } catch {
    // Private mode — not remembered.
  }
}
