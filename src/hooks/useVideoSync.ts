"use client";

import { RefObject, useEffect } from "react";

export function useVideoSync(
  masterRef: RefObject<HTMLVideoElement | null>,
  foregroundRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const master = masterRef.current;
    const foreground = foregroundRef.current;
    if (!master || !foreground) return;

    let frame = 0;

    const synchronize = () => {
      if (
        !master.paused &&
        Math.abs(master.currentTime - foreground.currentTime) > 0.04
      ) {
        foreground.currentTime = master.currentTime;
      }
      frame = requestAnimationFrame(synchronize);
    };

    master.currentTime = 0;
    foreground.currentTime = 0;
    void Promise.allSettled([master.play(), foreground.play()]);
    frame = requestAnimationFrame(synchronize);

    return () => cancelAnimationFrame(frame);
  }, [enabled, foregroundRef, masterRef]);
}
