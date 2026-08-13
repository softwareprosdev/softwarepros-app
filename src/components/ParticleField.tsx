"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number; threat: boolean };

/**
 * The connected-particle background from the hero sections. `variant="threat"`
 * is the cybersecurity page's version, where a fraction of nodes glow red.
 * Honours prefers-reduced-motion by drawing a single static frame.
 */
export function ParticleField({
  className = "",
  count = 80,
  variant = "default",
  linkDistance = 150,
}: {
  className?: string;
  count?: number;
  variant?: "default" | "threat";
  linkDistance?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];

    const seed = () => {
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        threat: variant === "threat" && Math.random() < 0.12,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) seed();
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        if (!reduceMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.threat ? 4 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.threat
          ? "rgba(239,68,68,0.9)"
          : variant === "threat"
            ? "rgba(14,165,233,0.5)"
            : "rgba(6,182,212,0.8)";
        ctx.fill();
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist >= linkDistance) continue;
          const t = 1 - dist / linkDistance;
          ctx.strokeStyle =
            a.threat || b.threat
              ? `rgba(239,68,68,${t * 0.45})`
              : `rgba(6,182,212,${t * 0.15})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [count, variant, linkDistance]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
