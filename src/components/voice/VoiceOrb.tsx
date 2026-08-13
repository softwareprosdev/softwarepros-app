"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { JSX } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

/**
 * Every visual quantity the orb interpolates. Keeping them in one flat record
 * of numbers means a state change is a single lerp over the whole look, so
 * colour, size and reactivity all cross-fade together instead of snapping
 * while the rest catches up.
 */
type OrbLook = {
  /** Sphere body colour. */
  cr: number;
  cg: number;
  cb: number;
  /** Rim / bloom colour — the part that reads as "energy". */
  rr: number;
  rg: number;
  rb: number;
  /** Resting radius as a fraction of half the canvas. */
  radius: number;
  /** Outer glow strength. */
  bloom: number;
  /** How far `level` is allowed to deform the rim. */
  react: number;
  /** Amplitude of the resting breathing pulse. */
  breath: number;
  /** Opacity of the rotating sweep. */
  spin: number;
};

const LOOKS: Record<OrbState, OrbLook> = {
  // Dim and slow — at rest the orb should recede rather than compete with the
  // copy beside it.
  idle: {
    cr: 34,
    cg: 78,
    cb: 122,
    rr: 56,
    rg: 132,
    rb: 172,
    radius: 0.38,
    bloom: 0.34,
    react: 0.02,
    breath: 0.032,
    spin: 0,
  },
  // Cyan, minimal breathing: the movement here should be attributable to the
  // speaker's voice, not to an ambient loop running underneath it.
  listening: {
    cr: 22,
    cg: 148,
    cb: 178,
    rr: 103,
    rg: 232,
    rb: 249,
    radius: 0.4,
    bloom: 0.7,
    react: 0.28,
    breath: 0.014,
    spin: 0,
  },
  // No amplitude reaction — there is no audio to react to, so the sweep is the
  // only thing that says "working".
  thinking: {
    cr: 40,
    cg: 96,
    cb: 190,
    rr: 125,
    rg: 211,
    rb: 252,
    radius: 0.39,
    bloom: 0.48,
    react: 0,
    breath: 0.022,
    spin: 1,
  },
  // Warmer sky-blue and a heavier bloom so the orb visibly takes the floor.
  speaking: {
    cr: 32,
    cg: 132,
    cb: 233,
    rr: 186,
    rg: 230,
    rb: 253,
    radius: 0.42,
    bloom: 1,
    react: 0.22,
    breath: 0.018,
    spin: 0,
  },
};

const LOOK_KEYS = Object.keys(LOOKS.idle) as (keyof OrbLook)[];

/** Concurrent expanding rings. Fixed pool — the loop never allocates. */
const RING_POOL = 5;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const readMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

// No media queries on the server; assume motion is allowed so the first client
// frame agrees with the markup, then let the subscription correct it.
const readMotionOnServer = () => false;

const rgba = (r: number, g: number, b: number, a: number) =>
  `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`;

/**
 * The hovering, audio-reactive orb at the centre of the voice conversation UI.
 * Purely decorative: the parent is responsible for saying, in text, what the
 * assistant is currently doing.
 */
export function VoiceOrb({
  state,
  level,
  className = "",
  size = 320,
}: {
  state: OrbState;
  /** 0..1 audio amplitude, updated ~60fps by the parent. */
  level: number;
  className?: string;
  /** px; the canvas is square. Default 320. */
  size?: number;
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(level);
  const stateRef = useRef(state);
  // Set by the render effect while reduced motion is on, so a state change can
  // repaint the one static frame without standing a rAF loop back up.
  const stillRef = useRef<((next: OrbState) => void) | null>(null);

  const reduced = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    readMotionOnServer,
  );

  // `level` changes ~60 times a second. Mirroring the props into refs means the
  // render effect below closes over stable values and is never torn down and
  // rebuilt mid-conversation — which would drop the smoothed amplitude, the
  // in-flight colour cross-fade and every live ring on the floor.
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Backing store in device pixels, CSS box in logical px. Without this the
    // gradients band and the rim turns to mush on phones and retina displays.
    // Capped at 2 because past that the fill cost stops buying visible detail.
    const applyScale = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applyScale();

    const half = size / 2;
    // The live look, walked towards LOOKS[state] a little each frame.
    const look: OrbLook = { ...LOOKS[stateRef.current] };
    // Ring lifetimes, 1 → 0. Zero means the slot is free.
    const rings = new Float32Array(RING_POOL);

    let smooth = 0;
    let lastEmit = -1;

    const drawFrame = (t: number, lvl: number, moving: boolean) => {
      ctx.clearRect(0, 0, size, size);

      // Two incommensurable periods, so the hover never visibly repeats.
      const drift = moving ? size * 0.018 : 0;
      const cx =
        half + (Math.sin(t * 0.37) + Math.sin(t * 0.13 + 1.7) * 0.5) * drift;
      const cy =
        half + (Math.cos(t * 0.29) + Math.sin(t * 0.19 + 0.6) * 0.6) * drift;

      const breath = moving ? Math.sin(t * 0.8) * look.breath : 0;
      const base = half * look.radius * (1 + breath) * (1 + lvl * look.react * 0.5);

      // Low-frequency wobble gives the rim a living surface; the amplitude term
      // rides on top of it so loud speech reads as the surface being pushed
      // outwards rather than as a separate effect switching on.
      const rimAt = (a: number) => {
        const wob =
          Math.sin(a * 3 + t * 0.7) * 0.034 +
          Math.sin(a * 5 - t * 0.45) * 0.021 +
          Math.sin(a * 7 + t * 1.05) * 0.013;
        const ripple =
          lvl *
          look.react *
          (0.35 +
            Math.sin(a * 6 - t * 2.6) * 0.45 +
            Math.sin(a * 11 + t * 3.4) * 0.2);
        return base * (1 + wob + ripple);
      };

      // Additive from here down: the orb sits on a near-black page, so light
      // should accumulate instead of painting over itself.
      ctx.globalCompositeOperation = "lighter";

      const bloom = ctx.createRadialGradient(cx, cy, base * 0.7, cx, cy, base * 2);
      bloom.addColorStop(0, rgba(look.rr, look.rg, look.rb, 0.3 * look.bloom));
      bloom.addColorStop(0.35, rgba(look.rr, look.rg, look.rb, 0.1 * look.bloom));
      bloom.addColorStop(1, rgba(look.rr, look.rg, look.rb, 0));
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, size, size);

      ctx.lineWidth = Math.max(1, size * 0.004);
      for (let i = 0; i < RING_POOL; i++) {
        const life = rings[i];
        if (life <= 0) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, base * (1 + 0.55 * (1 - life)), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          look.rr,
          look.rg,
          look.rb,
          life * life * 0.45 * look.bloom,
        );
        ctx.stroke();
      }

      // The deformed silhouette, built once and used for both the body fill and
      // the rim stroke.
      ctx.beginPath();
      for (let i = 0; i <= SEGMENTS; i++) {
        const a = (i / SEGMENTS) * Math.PI * 2;
        const r = rimAt(a);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // The body is opaque — an additive sphere over its own bloom washes out
      // to a flat disc and loses all sense of volume.
      ctx.globalCompositeOperation = "source-over";
      const body = ctx.createRadialGradient(
        cx - base * 0.3,
        cy - base * 0.36,
        base * 0.05,
        cx,
        cy,
        base * 1.02,
      );
      body.addColorStop(
        0,
        rgba(
          Math.min(255, look.cr * 1.5 + 70),
          Math.min(255, look.cg * 1.35 + 60),
          Math.min(255, look.cb * 1.25 + 40),
          0.95,
        ),
      );
      body.addColorStop(0.5, rgba(look.cr, look.cg, look.cb, 0.82));
      body.addColorStop(1, rgba(look.cr * 0.22, look.cg * 0.22, look.cb * 0.3, 0.72));
      ctx.fillStyle = body;
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = Math.max(1, size * 0.005);
      ctx.strokeStyle = rgba(look.rr, look.rg, look.rb, 0.4 + lvl * 0.45);
      ctx.stroke();

      // Thinking: a comet head running the rim. Drawn as short segments because
      // a single stroke cannot fade along its own length.
      if (look.spin > 0.02) {
        const head = t * 1.25;
        ctx.lineWidth = Math.max(1.5, size * 0.011);
        ctx.lineCap = "round";
        for (let s = 0; s < SWEEP_STEPS; s++) {
          const f = s / SWEEP_STEPS;
          const a0 = head - SWEEP_ARC * f;
          const a1 = head - SWEEP_ARC * ((s + 1) / SWEEP_STEPS);
          const r0 = rimAt(a0);
          const r1 = rimAt(a1);
          ctx.strokeStyle = rgba(
            look.rr,
            look.rg,
            look.rb,
            (1 - f) * 0.6 * look.spin,
          );
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0);
          ctx.lineTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1);
          ctx.stroke();
        }
      }

      // Fixed specular highlight — it does not follow the hover, which is what
      // sells the drift as the object moving under a stationary light.
      const spec = ctx.createRadialGradient(
        cx - base * 0.36,
        cy - base * 0.42,
        0,
        cx - base * 0.36,
        cy - base * 0.42,
        base * 0.5,
      );
      spec.addColorStop(0, "rgba(255,255,255,0.22)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx - base * 0.36, cy - base * 0.42, base * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced) {
      // Reduced motion is a JS problem here: the media query in globals.css
      // only reaches CSS animations, and a canvas driven by rAF sails straight
      // past it. One frame, no drift, no rings — but the palette still carries
      // the state, which is the part that is actually informative.
      stillRef.current = (next) => {
        Object.assign(look, LOOKS[next]);
        drawFrame(0, 0, false);
      };
      stillRef.current(stateRef.current);

      const onResize = () => {
        applyScale();
        drawFrame(0, 0, false);
      };
      window.addEventListener("resize", onResize);
      return () => {
        stillRef.current = null;
        window.removeEventListener("resize", onResize);
      };
    }

    window.addEventListener("resize", applyScale);

    let frame = 0;
    let t = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamped so a backgrounded tab does not resume with one enormous step
      // that teleports the orb and fires every ring at once.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const target = levelRef.current;
      const prev = smooth;
      // Asymmetric, and expressed as a time constant so the feel does not
      // change with frame rate. Fast attack tracks syllable onsets; the slow
      // release is what stops raw analyser jitter from strobing the orb.
      const tau = target > smooth ? 0.045 : 0.18;
      smooth += (target - smooth) * (1 - Math.exp(-dt / tau));

      const want = LOOKS[stateRef.current];
      // ~0.4s to settle, so states dissolve into each other.
      const blend = 1 - Math.exp(-dt / 0.13);
      for (const key of LOOK_KEYS) {
        look[key] += (want[key] - look[key]) * blend;
      }

      for (let i = 0; i < RING_POOL; i++) {
        if (rings[i] > 0) rings[i] = Math.max(0, rings[i] - dt / 1.15);
      }
      // Rings mark onsets, not loudness — the rising edge is what the eye reads
      // as "that was a new sound".
      if (
        look.react > 0.05 &&
        smooth > 0.34 &&
        smooth - prev > 0.012 &&
        t - lastEmit > 0.22
      ) {
        for (let i = 0; i < RING_POOL; i++) {
          if (rings[i] <= 0) {
            rings[i] = 1;
            lastEmit = t;
            break;
          }
        }
      }

      drawFrame(t, smooth, true);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", applyScale);
    };
  }, [size, reduced]);

  // Only reachable with reduced motion on, where nothing else would repaint.
  useEffect(() => {
    stillRef.current?.(state);
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

/** Enough to read as a curve at 320px without paying for points nobody sees. */
const SEGMENTS = 96;
const SWEEP_STEPS = 22;
const SWEEP_ARC = 1.5;
