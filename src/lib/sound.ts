"use client";

/**
 * Motor de som leve — gera tons curtos via Web Audio API (sem arquivos de
 * áudio), no estilo discreto da marca: tons quentes, volume baixo, duração curta.
 */
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(ctx: AudioContext, opts: { freq: number; start: number; dur: number; type?: OscillatorType; peak?: number; endFreq?: number; }) {
  const { freq, start, dur, type = "sine", peak = 0.09, endFreq } = opts;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + dur);
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

export type SoundName = "click" | "toggle" | "open" | "close" | "add" | "success" | "error" | "checkout";

const LIBRARY: Record<SoundName, (ctx: AudioContext) => void> = {
  click: (ctx) => tone(ctx, { freq: 720, start: 0, dur: 0.07, type: "sine", peak: 0.06 }),
  toggle: (ctx) => tone(ctx, { freq: 540, start: 0, dur: 0.08, type: "triangle", peak: 0.06 }),
  open: (ctx) => tone(ctx, { freq: 520, start: 0, dur: 0.09, type: "sine", peak: 0.05, endFreq: 660 }),
  close: (ctx) => tone(ctx, { freq: 520, start: 0, dur: 0.09, type: "sine", peak: 0.05, endFreq: 400 }),
  add: (ctx) => {
    tone(ctx, { freq: 600, start: 0, dur: 0.09, type: "sine", peak: 0.08 });
    tone(ctx, { freq: 860, start: 0.07, dur: 0.11, type: "sine", peak: 0.07 });
  },
  success: (ctx) => {
    tone(ctx, { freq: 660, start: 0, dur: 0.1, type: "sine", peak: 0.08 });
    tone(ctx, { freq: 880, start: 0.09, dur: 0.16, type: "sine", peak: 0.08 });
    tone(ctx, { freq: 990, start: 0.18, dur: 0.18, type: "sine", peak: 0.06 });
  },
  error: (ctx) => {
    tone(ctx, { freq: 340, start: 0, dur: 0.14, type: "sine", peak: 0.08 });
    tone(ctx, { freq: 260, start: 0.1, dur: 0.18, type: "sine", peak: 0.07 });
  },
  checkout: (ctx) => {
    tone(ctx, { freq: 520, start: 0, dur: 0.11, type: "sine", peak: 0.08 });
    tone(ctx, { freq: 660, start: 0.09, dur: 0.11, type: "sine", peak: 0.08 });
    tone(ctx, { freq: 880, start: 0.18, dur: 0.22, type: "sine", peak: 0.08 });
  }
};

export function playSoundRaw(name: SoundName) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    LIBRARY[name](ctx);
  } catch {
    /* som é só um detalhe — nunca deve quebrar a interface */
  }
}
