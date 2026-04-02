import { useState, useEffect } from "react";

export interface ClockTime {
  hours: number;
  minutes: number;
  seconds: number;
  hours12: number;
  ampm: "AM" | "PM";
  dateStr: string;
  dayStr: string;
}

export function useClock(): ClockTime {
  const [time, setTime] = useState<ClockTime>(() => getTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function getTime(): ClockTime {
  const now = new Date();
  const h = now.getHours();
  return {
    hours: h,
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    hours12: h % 12 || 12,
    ampm: h < 12 ? "AM" : "PM",
    dateStr: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    dayStr: now.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}
