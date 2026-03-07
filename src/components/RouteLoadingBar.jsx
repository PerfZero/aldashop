"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./RouteLoadingBar.module.css";

const INITIAL_PROGRESS = 18;
const NAVIGATION_START_PROGRESS = 12;
const MAX_PROGRESS_BEFORE_DONE = 94;
const FINISH_DELAY_MS = 220;
const SAFETY_DONE_MS = 12000;
const VISUAL_READY_TIMEOUT_MS = 3500;

export default function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const [progress, setProgress] = useState(INITIAL_PROGRESS);
  const [isVisible, setIsVisible] = useState(true);

  const trickleTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const routeTransitionRef = useRef(false);
  const initializedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (trickleTimerRef.current) {
      window.clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const start = useCallback((startFrom = NAVIGATION_START_PROGRESS) => {
    if (routeTransitionRef.current) return;

    clearTimers();
    routeTransitionRef.current = true;
    setIsVisible(true);
    setProgress((prev) => Math.max(startFrom, prev || 0));

    trickleTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= MAX_PROGRESS_BEFORE_DONE) return prev;
        const next = prev + Math.max(0.5, (MAX_PROGRESS_BEFORE_DONE - prev) * 0.12);
        return Math.min(MAX_PROGRESS_BEFORE_DONE, next);
      });
    }, 170);

    safetyTimerRef.current = window.setTimeout(() => {
      routeTransitionRef.current = false;
      setProgress(100);
      finishTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, FINISH_DELAY_MS);
    }, SAFETY_DONE_MS);
  }, [clearTimers]);

  const done = useCallback(() => {
    clearTimers();
    routeTransitionRef.current = false;
    setProgress(100);
    finishTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, FINISH_DELAY_MS);
  }, [clearTimers]);

  const waitForVisibleImages = useCallback(() => {
    return new Promise((resolve) => {
      const images = Array.from(document.querySelectorAll("main img"));
      const viewportBottom = window.innerHeight * 1.2;
      const pending = images.filter((img) => {
        if (img.complete && img.naturalWidth > 0) return false;
        const rect = img.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (rect.bottom < 0) return false;
        if (rect.top > viewportBottom) return false;
        return true;
      });

      if (pending.length === 0) {
        resolve();
        return;
      }

      let settled = false;
      let completed = 0;
      const cleanups = [];

      const finish = () => {
        if (settled) return;
        settled = true;
        cleanups.forEach((cleanup) => cleanup());
        resolve();
      };

      const onComplete = () => {
        completed += 1;
        if (completed >= pending.length) {
          finish();
        }
      };

      pending.forEach((img) => {
        const onLoad = () => onComplete();
        const onError = () => onComplete();
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onError, { once: true });
        cleanups.push(() => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
        });
      });

      const timeoutId = window.setTimeout(finish, VISUAL_READY_TIMEOUT_MS);
      cleanups.push(() => window.clearTimeout(timeoutId));
    });
  }, []);

  useEffect(() => {
    const onInitialLoadDone = async () => {
      await waitForVisibleImages();
      done();
    };

    if (document.readyState === "complete") {
      const timer = window.setTimeout(onInitialLoadDone, 90);
      return () => window.clearTimeout(timer);
    }

    start(INITIAL_PROGRESS);
    window.addEventListener("load", onInitialLoadDone);
    return () => {
      window.removeEventListener("load", onInitialLoadDone);
    };
  }, [done, start, waitForVisibleImages]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (routeTransitionRef.current) {
      let cancelled = false;

      const finishTransition = async () => {
        await waitForVisibleImages();
        if (!cancelled) {
          done();
        }
      };

      finishTransition();
      return () => {
        cancelled = true;
      };
    }
  }, [pathname, search, done, waitForVisibleImages]);

  useEffect(() => {
    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const current = window.location.pathname + window.location.search + window.location.hash;
      const next = nextUrl.pathname + nextUrl.search + nextUrl.hash;
      if (current === next) return;

      start();
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [start]);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    const shouldStartForUrl = (urlLike) => {
      if (!urlLike) return false;
      const nextUrl = new URL(String(urlLike), window.location.href);
      const current = window.location.pathname + window.location.search + window.location.hash;
      const next = nextUrl.pathname + nextUrl.search + nextUrl.hash;
      return current !== next;
    };

    window.history.pushState = function patchedPushState(state, unused, url) {
      if (shouldStartForUrl(url)) start();
      return originalPushState(state, unused, url);
    };

    window.history.replaceState = function patchedReplaceState(state, unused, url) {
      if (shouldStartForUrl(url)) start();
      return originalReplaceState(state, unused, url);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [start]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <div className={styles.loader} aria-hidden="true">
      <div
        className={`${styles.bar} ${isVisible ? styles.visible : ""}`}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
