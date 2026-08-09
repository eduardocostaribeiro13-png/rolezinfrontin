import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ScrollScrubVideoProps {
  /** Absolute URL of the MP4 that will be scrubbed by the scroll position. */
  src: string;
  /** Static image shown before the video is ready (and under reduced motion). */
  poster: string;
  /** Element that defines the cinematic scroll area (heroStart -> heroEnd). */
  sectionRef: RefObject<HTMLElement | null>;
  /**
   * Called on every animation frame with the smoothed progress (0..1).
   * Keep the handler cheap: it runs at frame rate.
   */
  onProgress?: (progress: number) => void;
  className?: string;
}

/** Smoothing factor for the scroll -> video interpolation (0.08 – 0.16). */
const SMOOTHING = 0.12;
/** Minimum delta before issuing a seek, avoids hammering the decoder. */
const SEEK_EPSILON = 0.04;

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * Background video whose playhead is driven exclusively by the scroll position
 * inside `sectionRef`. No autoplay, no loop: scrolling down advances the film,
 * scrolling up rewinds it, stopping freezes it.
 */
export function ScrollScrubVideo({ src, poster, sectionRef, onProgress, className }: ScrollScrubVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect the user's motion preference: no scrubbing, just a static frame.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let frame = 0;
    let smoothed = 0;
    let target = 0;
    let disposed = false;

    const readTarget = () => {
      const rect = section.getBoundingClientRect();
      // Scrollable distance inside the cinematic area.
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return 0;
      return clamp01(-rect.top / travel);
    };

    const tick = () => {
      if (disposed) return;
      target = readTarget();
      smoothed += (target - smoothed) * SMOOTHING;
      if (Math.abs(target - smoothed) < 0.0005) smoothed = target;

      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0 && !reducedMotion) {
        const targetTime = smoothed * Math.max(duration - 0.05, 0);
        if (Math.abs(video.currentTime - targetTime) > SEEK_EPSILON) {
          try {
            video.currentTime = targetTime;
          } catch {
            // Seeking can throw while metadata is still settling — ignore.
          }
        }
      }

      onProgress?.(smoothed);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
    };
  }, [sectionRef, onProgress, reducedMotion]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[65%_center] md:object-center"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {!reducedMotion && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onLoadedData={() => setReady(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-[60%_center] md:object-center transition-opacity duration-500",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}

export default ScrollScrubVideo;
