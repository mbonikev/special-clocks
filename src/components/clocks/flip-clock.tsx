"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pad } from "./use-clock";

function FlipDigit({ value, full }: { value: string; full?: boolean }) {
  const [current, setCurrent] = useState(value);
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevVal = useRef(value);

  useEffect(() => {
    if (value !== prevVal.current) {
      setPrev(prevVal.current);
      setFlipping(true);
      const t = setTimeout(() => {
        setCurrent(value);
        setFlipping(false);
      }, 220);
      prevVal.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const cardH = full ? "min(20vh, 18vw)" : "min(56px, 14vw)";
  const cardW = full ? "min(14vw, 16vh)" : "min(40px, 10vw)";
  const fontSize = full ? "min(14vh, 12vw)" : "clamp(1.8rem, 5vw, 3rem)";

  return (
    <div style={{ position: "relative", width: cardW, height: `calc(${cardH} * 2)` }}>
      {/* Upper half - current */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: cardH,
          overflow: "hidden",
          background: "var(--surface)",
          borderBottom: "1px solid var(--bg)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: "0.04em",
        }}
      >
        <span style={{ fontSize, fontFamily: "monospace", color: "var(--text)", fontWeight: 600, lineHeight: 1 }}>
          {current}
        </span>
      </div>

      {/* Lower half - current */}
      <div
        style={{
          position: "absolute",
          top: cardH,
          left: 0,
          right: 0,
          height: cardH,
          overflow: "hidden",
          background: "var(--bg-subtle)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "0.04em",
        }}
      >
        <span style={{ fontSize, fontFamily: "monospace", color: "var(--text)", fontWeight: 600, lineHeight: 1 }}>
          {current}
        </span>
      </div>

      {/* Flip overlay — top half flipping down */}
      <AnimatePresence>
        {flipping && (
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: cardH,
              overflow: "hidden",
              background: "var(--bg-muted)",
              transformOrigin: "bottom center",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: "0.04em",
              zIndex: 10,
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.22, ease: "easeIn" }}
          >
            <span style={{ fontSize, fontFamily: "monospace", color: "var(--text)", fontWeight: 600, lineHeight: 1 }}>
              {prev}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: cardH,
          left: 0,
          right: 0,
          height: "1px",
          background: "var(--bg)",
          zIndex: 20,
        }}
      />
    </div>
  );
}

export function FlipClock({ full }: { full?: boolean }) {
  const [time, setTime] = useState(() => {
    const n = new Date();
    return { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() };
  });

  useEffect(() => {
    const iv = setInterval(() => {
      const n = new Date();
      setTime({ h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const gap = full ? "min(1.5vw, 2vh)" : "0.4rem";
  const colonSize = full ? "min(8vh, 7vw)" : "clamp(1.2rem, 3vw, 2rem)";

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ background: "var(--bg)", gap }}
    >
      {/* Hours */}
      <FlipDigit value={pad(time.h)[0]} full={full} />
      <FlipDigit value={pad(time.h)[1]} full={full} />

      {/* Colon */}
      <span style={{ fontSize: colonSize, color: "var(--text-subtle)", fontFamily: "monospace", fontWeight: 300, userSelect: "none" }}>:</span>

      {/* Minutes */}
      <FlipDigit value={pad(time.m)[0]} full={full} />
      <FlipDigit value={pad(time.m)[1]} full={full} />

      {/* Colon */}
      <span style={{ fontSize: colonSize, color: "var(--text-subtle)", fontFamily: "monospace", fontWeight: 300, userSelect: "none" }}>:</span>

      {/* Seconds */}
      <FlipDigit value={pad(time.s)[0]} full={full} />
      <FlipDigit value={pad(time.s)[1]} full={full} />
    </div>
  );
}
