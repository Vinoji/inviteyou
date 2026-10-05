"use client";

import { useEffect, useRef, useState } from "react";
import { artSrc } from "../ArtImage";
import useSafeReducedMotion from "../../useSafeReducedMotion";
import c from "../cinema/cinema.module.css";

/**
 * A "living photo": a real photograph plus its depth map (near = bright),
 * drawn with a tiny WebGL shader that shifts each pixel by its depth. As
 * the section scrolls past, the camera dollies in and tilts — so the
 * foreground moves more than the background and the photo reads as 3D. A
 * slow sway keeps it breathing while still.
 *
 * Files: public/art/<templateId>/<slot>.webp and <slot>-depth.webp (depth
 * maps made offline with Depth Anything V2 Small — docs/template-art.md).
 *
 * Light by design: one quad, two textures, no 3D library. It renders only
 * while on screen, at most 1.5× device pixels, and falls back to the plain
 * photo with a slow zoom without WebGL or when motion is reduced.
 */

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D img;
uniform sampler2D dep;
uniform vec2 cover;   // object-fit: cover, as a uv scale
uniform float zoom;   // dolly
uniform vec2 shift;   // parallax, in uv
uniform float focus;  // depth that stays still
varying vec2 uv;
void main() {
  vec2 q = (uv - 0.5) * cover / zoom + 0.5;
  // Two passes: sample depth where the pixel lands, not where it started,
  // so edges smear less.
  float d = texture2D(dep, q).r;
  vec2 r = q + shift * (d - focus);
  d = texture2D(dep, r).r;
  r = q + shift * (d - focus);
  gl_FragColor = texture2D(img, clamp(r, 0.002, 0.998));
}`;

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

export default function DepthPhoto({
  templateId,
  slot,
  strength = 1,
  dolly = 0.12,
  focus = 0.35,
  priority = false,
  className = "",
}: {
  templateId: string;
  slot: string;
  /** How far near things move — 1 is a comfortable default. */
  strength?: number;
  /** How much the camera pushes in across the section's scroll. */
  dolly?: number;
  /** The depth (0 far … 1 near) that stays put while the rest moves. */
  focus?: number;
  priority?: boolean;
  className?: string;
}) {
  const reduce = useSafeReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const src = artSrc(templateId, slot);
  const depthSrc = artSrc(templateId, `${slot}-depth`);

  useEffect(() => {
    if (reduce || !src || !depthSrc) return;
    const box = boxRef.current;
    if (!box) return;
    // A fresh canvas per run: a context released in cleanup can't be reused
    // (React runs effects twice in development), and it keeps contexts from
    // piling up as sections come and go.
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .6s ease";
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) return;
    box.appendChild(canvas);

    let disposed = false;
    let raf = 0;
    let visible = false;
    let progress = 0.5;
    let pointer = 0;
    let imgAspect = 1;
    const start = performance.now();

    const compile = (type: number, code: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, code);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uCover = u("cover");
    const uZoom = u("zoom");
    const uShift = u("shift");
    const uFocus = u("focus");
    gl.uniform1i(u("img"), 0);
    gl.uniform1i(u("dep"), 1);

    const texture = (unit: number, im: HTMLImageElement) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    };

    const size = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const boxAspect = r.width / Math.max(1, r.height);
      gl.uniform2f(uCover, ...(boxAspect > imgAspect ? [1, imgAspect / boxAspect] : [boxAspect / imgAspect, 1]) as [number, number]);
    };

    // Section progress: 0 as it enters from below, 1 as it leaves at the top.
    const measure = () => {
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || disposed) return;
      measure();
      const t = (now - start) / 1000;
      const sway = Math.sin(t * 0.35) * 0.6 + pointer * 0.8;
      const k = 0.045 * strength;
      gl.uniform1f(uZoom, 1.08 + dolly * progress);
      gl.uniform2f(uShift, sway * k * 0.5, (progress - 0.5) * k);
      gl.uniform1f(uFocus, focus);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting && !document.hidden;
        kick();
      },
      { rootMargin: "100px 0px" }
    );
    const ro = new ResizeObserver(() => {
      size();
      kick();
    });
    const onPointer = (e: PointerEvent) => {
      pointer = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    const onVisibility = () => {
      visible = !document.hidden && visible;
      kick();
    };

    Promise.all([load(src), load(depthSrc)])
      .then(([im, dm]) => {
        if (disposed) return;
        imgAspect = im.naturalWidth / im.naturalHeight;
        texture(0, im);
        texture(1, dm);
        size();
        io.observe(box);
        ro.observe(box);
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        canvas.style.opacity = "1";
        setLive(true);
      })
      .catch(() => {
        // Stays on the plain photo.
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      setLive(false);
    };
  }, [reduce, src, depthSrc, strength, dolly, focus]);

  if (!src) return null;
  return (
    <div ref={boxRef} className={className} style={{ position: "absolute", inset: 0, overflow: "hidden" }} aria-hidden>
      {/* The plain photo: shown first, and kept without WebGL or with reduced motion. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className={`${c.photo} ${reduce ? "" : c.kenburns}`}
        style={{ opacity: live ? 0 : 1, transition: "opacity .6s ease" }}
      />
    </div>
  );
}
