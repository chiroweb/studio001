"use client";

import Image from "next/image";
import {
  CSSProperties,
  TouchEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categoryLabel, Project, projects } from "@/data/projects";
import { useVideoSync } from "@/hooks/useVideoSync";
import { clamp, normalizeAngle } from "@/utils/math";

gsap.registerPlugin(ScrollTrigger);

const FEATURED_COUNT = 8;
const STEP = (Math.PI * 2) / FEATURED_COUNT;
const FOCUS_ANGLE = Math.PI / 2;

type OrbitState = {
  project: Project;
  index: number;
  front: boolean;
  focus: number;
  style: CSSProperties;
};

const pad = (value: number) => String(value).padStart(2, "0");

function useViewport() {
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });

  useLayoutEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewport;
}

function FixedBackground({
  masterRef,
  onReady,
  dimmed,
  release,
  reducedMotion,
}: {
  masterRef: React.RefObject<HTMLVideoElement | null>;
  onReady: () => void;
  dimmed: boolean;
  release: number;
  reducedMotion: boolean;
}) {
  const backgroundStyle = {
    "--video-opacity": dimmed ? 0.08 : 1 - release * 0.55,
    "--video-brightness": dimmed ? 0.32 : 1 - release * 0.35,
  } as CSSProperties;

  return (
    <>
      <div
        className={`fixedBackground${reducedMotion ? " is-reduced" : ""}`}
        style={backgroundStyle}
        aria-hidden="true"
      >
        <video
          ref={masterRef}
          className="backgroundVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/bliss-cosmos-poster.jpg"
          onCanPlay={onReady}
        >
          <source src="/media/bliss-cosmos-bg.webm" type="video/webm" />
          <source src="/media/bliss-cosmos-bg.mp4" type="video/mp4" />
        </video>
        <div className="backgroundPoster" />
      </div>
      <div className="backgroundShade" aria-hidden="true" />
    </>
  );
}

function Header({ loaded }: { loaded: boolean }) {
  return (
    <header className={`siteHeader${loaded ? " is-visible" : ""}`}>
      <a className="wordmark" href="#work" aria-label="BLISS CONTENTS 홈">
        <span>BLISS</span>
        <span>CONTENTS</span>
      </a>
      <nav className="mainNav" aria-label="주요 메뉴">
        <a href="#work">WORK</a>
        <a href="#next-chapter">ABOUT</a>
        <a href="#next-chapter">CONTACT</a>
      </nav>
    </header>
  );
}

function OrbitCard({
  state,
  active,
  first,
  onFirstLoad,
  onOpen,
}: {
  state: OrbitState;
  active: boolean;
  first: boolean;
  onFirstLoad: () => void;
  onOpen: (project: Project) => void;
}) {
  const { project, style, focus } = state;

  return (
    <button
      className={`posterCard${active ? " is-active" : ""}`}
      style={style}
      type="button"
      tabIndex={active ? 0 : -1}
      aria-label={`${project.title} 프로젝트 보기`}
      aria-hidden={!active && focus < 0.05}
      data-cursor={active ? "view" : undefined}
      onClick={() => active && onOpen(project)}
    >
      <span className="posterImage">
        <Image
          src={project.cover}
          alt={`${project.title} 대표 스틸`}
          fill
          sizes="(max-width: 767px) 62vw, (max-width: 1023px) 38vw, 24vw"
          priority={first}
          onLoad={first ? onFirstLoad : undefined}
        />
      </span>
      <span className="srOnly">
        {categoryLabel[project.category]} · {project.year}
      </span>
    </button>
  );
}

function ProjectMeta({
  project,
  index,
  visible,
}: {
  project: Project;
  index: number;
  visible: boolean;
}) {
  return (
    <div className={`projectMeta${visible ? " is-visible" : ""}`}>
      <div className="projectMetaInner" key={project.id}>
        <p className="projectCount">
          {pad(index + 1)} <span>/</span> {pad(FEATURED_COUNT)}
        </p>
        <h1>{project.title}</h1>
        <p className="projectType">
          {categoryLabel[project.category]} <span>·</span> {project.year}
        </p>
      </div>
    </div>
  );
}

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"default" | "view" | "scroll">("default");

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

    const move = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const inspect = (event: PointerEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-cursor]",
      );
      const next = element?.dataset.cursor;
      setMode(next === "view" || next === "scroll" ? next : "default");
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", inspect);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", inspect);
    };
  }, []);

  return (
    <div ref={cursorRef} className={`customCursor is-${mode}`} aria-hidden="true">
      <span>{mode === "view" ? "VIEW" : mode === "scroll" ? "SCROLL" : ""}</span>
    </div>
  );
}

function ProjectOverlay({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, project]);

  if (!project) return null;

  return (
    <section
      className="projectOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} 프로젝트 미리보기`}
    >
      <button className="overlayClose" type="button" onClick={onClose}>
        CLOSE
      </button>
      <div className="overlayImage">
        <Image
          src={project.cover}
          alt={`${project.title} 대표 스틸`}
          fill
          sizes="(max-width: 767px) 100vw, 54vw"
          priority
        />
      </div>
      <div className="overlayCopy">
        <p className="overlayEyebrow">
          {categoryLabel[project.category]} · {project.year}
        </p>
        <h2>{project.title}</h2>
        <p className="overlayRole">{project.role}</p>
        <p className="overlayDescription">{project.description}</p>
        <p className="overlayPhase">FULL PROJECT · PHASE 02</p>
      </div>
    </section>
  );
}

function Loader({ done }: { done: boolean }) {
  return (
    <div className={`loader${done ? " is-done" : ""}`} aria-hidden={done}>
      <div className="loaderMark">
        <span>BLISS</span>
        <span>CONTENTS</span>
      </div>
      <div className="loaderLine" />
    </div>
  );
}

export function BlissHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const masterVideoRef = useRef<HTMLVideoElement>(null);
  const foregroundVideoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [firstImageReady, setFirstImageReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [reducedIndex, setReducedIndex] = useState(0);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const viewport = useViewport();

  const featured = useMemo(
    () =>
      projects
        .filter((project) => project.featured)
        .sort((a, b) => a.featuredOrder - b.featuredOrder)
        .slice(0, FEATURED_COUNT),
    [],
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const minimum = window.setTimeout(() => {
      if (videoReady && firstImageReady) setLoaded(true);
    }, 900);
    const maximum = window.setTimeout(() => setLoaded(true), 3000);

    if (videoReady && firstImageReady) {
      const ready = window.setTimeout(() => setLoaded(true), 900);
      return () => {
        clearTimeout(minimum);
        clearTimeout(maximum);
        clearTimeout(ready);
      };
    }

    return () => {
      clearTimeout(minimum);
      clearTimeout(maximum);
    };
  }, [firstImageReady, videoReady]);

  useEffect(() => {
    document.body.classList.toggle("is-loading", !loaded);
    document.body.classList.toggle("has-overlay", Boolean(activeProject));
    return () => {
      document.body.classList.remove("is-loading");
      document.body.classList.remove("has-overlay");
    };
  }, [activeProject, loaded]);

  useVideoSync(
    masterVideoRef,
    foregroundVideoRef,
    loaded && !reducedMotion,
  );

  useLayoutEffect(() => {
    if (!loaded || reducedMotion || !sectionRef.current || !sceneRef.current) {
      return;
    }

    const motion = { value: 0 };
    let lenis: Lenis | null = null;
    let orbitTween: gsap.core.Tween | null = null;
    let snapTimer = 0;
    let snapping = false;
    const isMobile = window.innerWidth < 768;

    const context = gsap.context(() => {
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      });

      const ticker = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      orbitTween = gsap.to(motion, {
        value: 1,
        ease: "none",
        onUpdate: () => setProgress(motion.value),
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: sceneRef.current,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      const snapToNearest = () => {
        const trigger = orbitTween?.scrollTrigger;
        if (!lenis || !trigger || snapping) return;

        const value = trigger.progress;
        if (value < 0.08 || value > 0.79) return;

        const featuredValue = clamp((value - 0.08) / 0.7);
        const snapped =
          0.08 + (Math.round(featuredValue * 7) / 7) * 0.7;
        if (Math.abs(snapped - value) < 0.004) return;

        const target =
          trigger.start + snapped * (trigger.end - trigger.start);
        snapping = true;
        lenis.scrollTo(target, {
          duration: 0.5,
          easing: (time) => 1 - Math.pow(1 - time, 3),
          onComplete: () => {
            snapping = false;
          },
        });
      };

      const handleScroll = () => {
        ScrollTrigger.update();
        if (isMobile || snapping) return;
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(snapToNearest, 110);
      };

      lenis.on("scroll", handleScroll);

      return () => {
        window.clearTimeout(snapTimer);
        gsap.ticker.remove(ticker);
        lenis?.destroy();
      };
    }, sectionRef);

    return () => context.revert();
  }, [loaded, reducedMotion]);

  useEffect(() => {
    const closeFromHistory = () => setActiveProject(null);
    window.addEventListener("popstate", closeFromHistory);
    return () => window.removeEventListener("popstate", closeFromHistory);
  }, []);

  const featuredProgress = reducedMotion
    ? reducedIndex / (FEATURED_COUNT - 1)
    : clamp((progress - 0.08) / 0.7);
  const release = reducedMotion ? 0 : clamp((progress - 0.88) / 0.12);
  const selectedIndex = reducedMotion
    ? reducedIndex
    : Math.round(featuredProgress * (FEATURED_COUNT - 1));
  const selectedProject = featured[selectedIndex] ?? featured[0];
  const rotation = -featuredProgress * STEP * (FEATURED_COUNT - 1);

  const orbitStates = useMemo<OrbitState[]>(() => {
    const { width, height } = viewport;
    const mobile = width < 768;
    const tablet = width >= 768 && width < 1024;
    const radiusX = mobile
      ? width * 0.62
      : tablet
        ? width * 0.46
        : clamp(width * 0.4, 420, 760);
    const radiusY = mobile
      ? height * 0.05
      : tablet
        ? clamp(height * 0.065, 44, 76)
        : clamp(height * 0.08, 55, 100);
    const radiusZ = mobile ? 180 : tablet ? 300 : 430;

    return featured.flatMap((project, index): OrbitState[] => {
        if (reducedMotion && index !== selectedIndex) return [];

        const angle = reducedMotion
          ? FOCUS_ANGLE
          : index * STEP + rotation + FOCUS_ANGLE;
        const x = reducedMotion ? 0 : Math.cos(angle) * radiusX;
        const depth = reducedMotion ? 1 : Math.sin(angle);
        const y = depth * radiusY;
        const z = depth * radiusZ * (1 - release);
        const delta = normalizeAngle(angle - FOCUS_ANGLE);
        const focus = reducedMotion
          ? 1
          : Math.exp(-Math.pow(delta / (mobile ? 0.42 : 0.48), 2));
        const depthNormalized = (depth + 1) / 2;
        const scale =
          0.64 + depthNormalized * 0.2 + focus * 0.16 - release * 0.08;
        const blur = reducedMotion
          ? 0
          : (1 - focus) * (mobile ? 3 : tablet ? 4 : 5.5);
        const brightness = 0.54 + focus * 0.46;
        const opacity =
          (0.35 + depthNormalized * 0.25 + focus * 0.4) * (1 - release * 0.92);
        const rotateY = reducedMotion
          ? 0
          : -(x / radiusX) * (mobile ? 4 : tablet ? 5 : 8) * (1 - release);
        const releasedY = y + release * height * 0.18;

        return [{
          project,
          index,
          front: reducedMotion || depth > 0.08,
          focus,
          style: {
            opacity: loaded ? opacity : 0,
            filter: `blur(${blur}px) brightness(${brightness})`,
            transform: `translate(-50%, -50%) translate3d(${x}px, ${releasedY}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
            pointerEvents:
              focus > 0.82 && release < 0.45 ? "auto" : "none",
          },
        } satisfies OrbitState];
      });
  }, [
    featured,
    loaded,
    reducedMotion,
    release,
    rotation,
    selectedIndex,
    viewport,
  ]);

  const backCards = orbitStates.filter((state) => !state.front);
  const frontCards = orbitStates.filter((state) => state.front);

  const openProject = (project: Project) => {
    window.history.pushState(
      { project: project.slug },
      "",
      `#project/${project.slug}`,
    );
    setActiveProject(project);
  };

  const closeProject = () => {
    setActiveProject(null);
    if (window.location.hash.startsWith("#project/")) window.history.back();
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? 0;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (viewport.width >= 768 || reducedMotion) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    if (Math.abs(delta) < 44) return;
    window.scrollBy({
      top: Math.sign(delta) * window.innerHeight * 0.56,
      behavior: "smooth",
    });
  };

  return (
    <main id="work">
      <Loader done={loaded} />
      <FixedBackground
        masterRef={masterVideoRef}
        onReady={() => setVideoReady(true)}
        dimmed={Boolean(activeProject)}
        release={release}
        reducedMotion={reducedMotion}
      />
      <Header loaded={loaded} />

      <section ref={sectionRef} className="heroScrollSection">
        <div
          ref={sceneRef}
          className={`pinnedHero${loaded ? " is-ready" : ""}`}
          data-cursor="scroll"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="orbitLayer orbitLayerBack" aria-hidden="true">
            {backCards.map((state) => (
              <OrbitCard
                key={`back-${state.project.id}`}
                state={state}
                active={false}
                first={state.index === 0}
                onFirstLoad={() => setFirstImageReady(true)}
                onOpen={openProject}
              />
            ))}
          </div>

          <div
            className="flowerOccluder"
            style={{ opacity: activeProject ? 0 : 1 - release }}
            aria-hidden="true"
          >
            {!reducedMotion && (
              <video
                ref={foregroundVideoRef}
                className="flowerOccluderVideo"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/media/bliss-cosmos-poster.jpg"
              >
                <source src="/media/bliss-cosmos-bg.webm" type="video/webm" />
                <source src="/media/bliss-cosmos-bg.mp4" type="video/mp4" />
              </video>
            )}
          </div>

          <div className="orbitLayer orbitLayerFront">
            {frontCards.map((state) => (
              <OrbitCard
                key={`front-${state.project.id}`}
                state={state}
                active={
                  state.index === selectedIndex &&
                  state.focus > 0.82 &&
                  release < 0.45
                }
                first={state.index === 0}
                onFirstLoad={() => setFirstImageReady(true)}
                onOpen={openProject}
              />
            ))}
          </div>

          <ProjectMeta
            project={selectedProject}
            index={selectedIndex}
            visible={loaded && release < 0.22}
          />

          <div
            className={`allWorksCue${progress > 0.78 && release < 0.12 ? " is-visible" : ""}`}
          >
            <span>FEATURED COMPLETE</span>
            <span>ALL WORKS BELOW</span>
          </div>

          <div className="scrollGuide" aria-hidden="true">
            <span>SCROLL TO FOCUS</span>
            <i />
          </div>

          {reducedMotion && (
            <div className="reducedControls" aria-label="대표작 선택">
              <button
                type="button"
                aria-label="이전 작품"
                onClick={() =>
                  setReducedIndex((index) =>
                    index === 0 ? FEATURED_COUNT - 1 : index - 1,
                  )
                }
              >
                ←
              </button>
              <button
                type="button"
                aria-label="다음 작품"
                onClick={() =>
                  setReducedIndex((index) =>
                    index === FEATURED_COUNT - 1 ? 0 : index + 1,
                  )
                }
              >
                →
              </button>
            </div>
          )}

          <div
            className={`archiveTransition${release > 0.25 ? " is-visible" : ""}`}
            style={{ opacity: clamp((release - 0.25) / 0.75) }}
            aria-hidden="true"
          >
            <span>ALL WORKS</span>
            <i />
          </div>
        </div>
      </section>

      <section id="next-chapter" className="nextChapter">
        <div className="nextChapterLabel">
          <span>02</span>
          <span>THE ARCHIVE</span>
        </div>
        <div>
          <p>THE STORY CONTINUES</p>
          <h2>
            EVERY FRAME,
            <br />
            GIVEN ITS SPACE.
          </h2>
        </div>
        <p className="nextChapterNote">
          ALL WORKS · ABOUT · CONTACT
          <br />
          TO BE CONTINUED IN PHASE 02
        </p>
      </section>

      <ProjectOverlay project={activeProject} onClose={closeProject} />
      <CustomCursor />
    </main>
  );
}
