"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Square } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PageShell } from "@/components/page-shell";

type NoiseType = "white" | "pink" | "brown";

interface Sound {
  id: string;
  label: string;
  emoji: string;
  description: string;
  frequency: number;
  type: NoiseType | OscillatorType;
}

const sounds: Sound[] = [
  { id: "white", label: "White Noise", emoji: "◈", description: "Full spectrum static", frequency: 0, type: "white" },
  { id: "pink", label: "Pink Noise", emoji: "◉", description: "Softer, natural static", frequency: 0, type: "pink" },
  { id: "brown", label: "Brown Noise", emoji: "◎", description: "Deep rumbling bass", frequency: 0, type: "brown" },
  { id: "40hz", label: "40Hz Gamma", emoji: "⊞", description: "Focus & concentration", frequency: 40, type: "sine" },
  { id: "10hz", label: "10Hz Alpha", emoji: "⊟", description: "Relaxed awareness", frequency: 10, type: "sine" },
  { id: "6hz", label: "6Hz Theta", emoji: "⊠", description: "Deep meditation", frequency: 6, type: "sine" },
];

function createNoiseBuffer(ctx: AudioContext, type: string): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // brown noise
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }

  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  return node;
}

export default function SoundsPage() {
  const { ambientSound, soundVolume, setAmbientSound, setSoundVolume } = useAppStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
  const [started, setStarted] = useState(false);

  const stopCurrent = () => {
    try {
      sourceRef.current?.stop();
    } catch (_) {}
    sourceRef.current?.disconnect();
    sourceRef.current = null;
  };

  const playSound = (sound: Sound) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.connect(ctx.destination);
    }
    gainRef.current.gain.value = soundVolume;

    stopCurrent();

    const isNoise = (sound.type === "white" || sound.type === "pink" || sound.type === "brown") as boolean;
    if (isNoise) {
      const node = createNoiseBuffer(ctx, sound.type as NoiseType);
      node.connect(gainRef.current);
      node.start();
      sourceRef.current = node;
    } else {
      const osc = ctx.createOscillator();
      osc.type = sound.type as OscillatorType;
      osc.frequency.value = sound.frequency;
      osc.connect(gainRef.current);
      osc.start();
      sourceRef.current = osc;
    }

    setStarted(true);
    setAmbientSound(sound.id);
  };

  const stopAll = () => {
    stopCurrent();
    setAmbientSound(null);
    setStarted(false);
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = soundVolume;
    }
  }, [soundVolume]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrent();
    };
  }, []);

  return (
    <PageShell className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 py-4 border-b shrink-0 flex items-center justify-between"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div>
          <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Ambient Sounds
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>
            Background noise for focus
          </p>
        </div>
        {started && (
          <button
            onClick={stopAll}
            className="flex items-center gap-2 px-3 py-1.5 border text-xs transition-colors hover:bg-[var(--bg-muted)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Square size={10} />
            Stop
          </button>
        )}
      </div>

      {/* Sound Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-3 max-w-lg">
          {sounds.map((sound) => {
            const active = ambientSound === sound.id && started;
            return (
              <motion.button
                key={sound.id}
                onClick={() => {
                  if (active) {
                    stopAll();
                  } else {
                    playSound(sound);
                  }
                }}
                className="flex flex-col items-start gap-2 p-4 border text-left transition-colors duration-150"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active ? "var(--bg-subtle)" : "var(--surface)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.08 }}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="text-xl font-mono"
                    style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
                  >
                    {sound.emoji}
                  </span>
                  {active && (
                    <motion.div
                      className="flex gap-0.5 items-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[3, 5, 4, 6, 3].map((h, i) => (
                        <motion.div
                          key={i}
                          className="w-0.5"
                          style={{ background: "var(--accent)" }}
                          animate={{ height: [h, h + 4, h] }}
                          transition={{
                            duration: 0.6 + i * 0.1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text)" }}>
                    {sound.label}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-subtle)" }}>
                    {sound.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Volume */}
        <div className="mt-6 max-w-lg">
          <div
            className="border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <VolumeX size={14} style={{ color: "var(--text-subtle)" }} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)] h-0.5"
                style={{ accentColor: "var(--accent)" }}
              />
              <Volume2 size={14} style={{ color: "var(--text-subtle)" }} />
              <span className="text-xs w-8 text-right font-mono" style={{ color: "var(--text-muted)" }}>
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
              {started ? `Playing: ${sounds.find((s) => s.id === ambientSound)?.label}` : "No sound playing"}
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
