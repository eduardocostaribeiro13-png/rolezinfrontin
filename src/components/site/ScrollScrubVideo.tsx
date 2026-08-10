import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ScrollScrubVideoProps {
  /** Absolute URL of the MP4 scrubbed by the page scroll position. */
  src: string;
  /** Static image shown until the first real video frame is available. */
  poster: string;
  /** Optional callback with the smoothed page progress (0..1). Runs at frame rate. */
  onProgress?: (progress: number) => void;
  className?: string;
}

/** Minimum delta before issuing a seek, avoids hammering the decoder. */
const SEEK_EPSILON = 0.02;

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * Global background video for the Home page. Fixed to the viewport and driven
 * exclusively by the total page scroll: no autoplay, no loop, no play().
 * The mapping is strictly 1:1 (no lerp/spring) — the real page position is the
 * single source of truth, and the black footer is excluded from the timeline.
 */
export function ScrollScrubVideo({ src, poster, onProgress, className }: ScrollScrubVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef(0);
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
    // Progress is always recomputed from the live scrollHeight, so late-loading
    // images/fonts that change the page height cannot freeze the mapping.
    // The footer is subtracted so the film ends as the footer enters.
    const readTarget = () => {
      const footer = document.querySelector("footer");
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
      const maxScroll = document.documentElement.scrollHeight - footerHeight - window.innerHeight;
      return maxScroll > 0 ? clamp01(window.scrollY / maxScroll) : 0;
    };

    const onScroll = () => {
      targetRef.current = readTarget();
    };

    targetRef.current = readTarget();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    let frame = 0;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const progress = targetRef.current;

      const video = videoRef.current;
      const duration = video?.duration;
      if (video && !reducedMotion && Number.isFinite(duration) && (duration as number) > 0) {
        const targetTime = progress * Math.max((duration as number) - 0.05, 0);
        if (Math.abs(video.currentTime - targetTime) > SEEK_EPSILON) {
          try {
            video.currentTime = targetTime;
          } catch {
            // Seeking can throw while metadata is still settling — ignore.
          }
        }
      }

      onProgress?.(progress);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onProgress, reducedMotion]);


  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-0 h-dvh w-full overflow-hidden bg-black", className)}
      aria-hidden="true"
    >
      <img
        src={poster}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-[65%_center] transition-opacity duration-500 md:object-center",
          ready && !reducedMotion ? "opacity-0" : "opacity-100",
        )}
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
          onCanPlay={() => setReady(true)}
          onSeeked={() => setReady(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-[60%_center] transition-opacity duration-500 md:object-center",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}

export default ScrollScrubVideo;
