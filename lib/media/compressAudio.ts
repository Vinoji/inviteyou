/**
 * Background music is re-encoded in the browser as a 160 kbps MP3 — near
 * transparent for music played through phone speakers, and MP3 plays on
 * every guest's device. Files that are already compact MP3/AAC are kept
 * untouched, since re-encoding them would only lose quality.
 */
const TARGET_KBPS = 160;
const KEEP_AT_OR_BELOW_KBPS = 200;
/** Largest file we'll try to compress (a WAV of a long song). */
export const MAX_AUDIO_INPUT = 120 * 1024 * 1024;
const PLAYS_EVERYWHERE = /^audio\/(mpeg|mp3|mp4|aac|x-m4a|m4a)$/;

type AudioCtor = typeof AudioContext;

async function decode(file: Blob): Promise<AudioBuffer | null> {
  const Ctor: AudioCtor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!Ctor) return null;
  let ctx: AudioContext;
  try {
    // 44.1 kHz is the MP3 standard rate; decodeAudioData resamples to it.
    ctx = new Ctor({ sampleRate: 44100 });
  } catch {
    ctx = new Ctor();
  }
  try {
    return await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    return null;
  } finally {
    void ctx.close();
  }
}

const BLOCK = 1152 * 20;

function toInt16(f: Float32Array, from: number, to: number) {
  const out = new Int16Array(to - from);
  for (let i = from; i < to; i++) {
    const v = Math.max(-1, Math.min(1, f[i]));
    out[i - from] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  return out;
}

/**
 * Encodes in short slices that yield back to the browser, so the page
 * stays responsive and the progress label can update. The encoder is
 * loaded only when a song actually needs it.
 */
async function encode(audio: AudioBuffer, onProgress?: (p: number) => void): Promise<Blob> {
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const left = audio.getChannelData(0);
  const right = audio.numberOfChannels > 1 ? audio.getChannelData(1) : null;
  const encoder = new Mp3Encoder(right ? 2 : 1, audio.sampleRate, TARGET_KBPS);
  const parts: BlobPart[] = [];
  let sliceStart = performance.now();
  for (let i = 0; i < left.length; i += BLOCK) {
    const end = Math.min(i + BLOCK, left.length);
    const chunk = right
      ? encoder.encodeBuffer(toInt16(left, i, end), toInt16(right, i, end))
      : encoder.encodeBuffer(toInt16(left, i, end));
    if (chunk.length) parts.push(new Uint8Array(chunk));
    if (performance.now() - sliceStart > 30) {
      onProgress?.(end / left.length);
      await new Promise((r) => setTimeout(r, 0));
      sliceStart = performance.now();
    }
  }
  const tail = encoder.flush();
  if (tail.length) parts.push(new Uint8Array(tail));
  return new Blob(parts, { type: "audio/mpeg" });
}

/**
 * The song, compressed when that helps. Falls back to the original file if
 * the browser can't decode or encode it.
 */
export async function compressAudio(file: File, onProgress?: (p: number) => void): Promise<Blob> {
  const audio = await decode(file);
  if (!audio || !audio.duration) return file;
  const kbps = (file.size * 8) / 1000 / audio.duration;
  if (kbps <= KEEP_AT_OR_BELOW_KBPS && PLAYS_EVERYWHERE.test(file.type)) return file;
  try {
    const mp3 = await encode(audio, onProgress);
    return mp3.size < file.size || !PLAYS_EVERYWHERE.test(file.type) ? mp3 : file;
  } catch (err) {
    console.error(err);
    return file;
  }
}
