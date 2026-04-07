import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBodyClass } from '../hooks/useBodyClass';

const VIDEO_ID = 'AlxNuMXkKqM';
const INTRO_VOLUME = 38;

function embedUrl() {
  const base = `https://www.youtube.com/embed/${VIDEO_ID}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=0`;
  try {
    const { protocol, origin } = window.location;
    if (protocol === 'http:' || protocol === 'https:') {
      return `${base}&origin=${encodeURIComponent(origin)}`;
    }
  } catch {
    /* ignore */
  }
  return base;
}

export function LandingPage() {
  useBodyClass('landing-body');
  const [showLanding, setShowLanding] = useState(false);
  const transitioned = useRef(false);
  const playerRef = useRef<{ destroy?: () => void } | null>(null);
  const apiHooked = useRef(false);

  const goToLanding = useCallback(() => {
    if (transitioned.current) return;
    transitioned.current = true;
    try {
      playerRef.current?.destroy?.();
    } catch {
      /* ignore */
    }
    playerRef.current = null;
    setShowLanding(true);
  }, []);

  const hookPlayer = useCallback(() => {
    if (apiHooked.current || !window.YT?.Player) return;
    apiHooked.current = true;
    playerRef.current = new window.YT.Player('ytEmbed', {
      events: {
        onReady: (e) => {
          const p = e.target;
          try {
            p.unMute?.();
            p.setVolume?.(INTRO_VOLUME);
          } catch {
            /* ignore */
          }
        },
        onStateChange: (e) => {
          if (e.data === window.YT?.PlayerState?.ENDED) {
            goToLanding();
          }
        },
      },
    });
  }, [goToLanding]);

  useEffect(() => {
    const onReady = () => hookPlayer();
    window.addEventListener('youtube-iframe-api-ready', onReady);
    queueMicrotask(() => {
      if (window.YT?.Player) hookPlayer();
    });
    return () => window.removeEventListener('youtube-iframe-api-ready', onReady);
  }, [hookPlayer]);

  useEffect(() => {
    const onLoad = () => {
      if (window.YT?.Player) hookPlayer();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, [hookPlayer]);

  return (
    <>
      <section
        id="videoIntro"
        className={`video-intro${showLanding ? ' is-hidden' : ''}`}
        aria-label="인트로 영상"
      >
        <div className="video-intro__stack">
          <div className="video-intro__toolbar">
            <button
              type="button"
              className="video-intro__skip"
              lang="en"
              aria-label="Skip intro video"
              onClick={goToLanding}
            >
              Skip
            </button>
          </div>
          <div className="video-intro__frame">
            <iframe
              id="ytEmbed"
              title="인트로 영상"
              src={embedUrl()}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
        <p className="video-intro__hint">
          인트로 영상은 기본 볼륨 38%로 재생됩니다. 일부 브라우저는 소리 있는 자동 재생을 제한할 수 있어요.
        </p>
      </section>

      <main
        id="mainLanding"
        className={`main-landing${showLanding ? ' is-active' : ' is-hidden'}`}
        aria-live="polite"
      >
        <div className="hero">
          <div className="hero-visual">
            <div className="hero-deco" aria-hidden />
            <div className="hero-card-ui" aria-hidden>
              <span className="hero-card-ui__check" />
              <span className="hero-card-ui__line" />
              <span className="hero-card-ui__line hero-card-ui__line--short" />
            </div>
            <div className="hero-character-wrap">
              <div className="hero-character" aria-hidden>
                <div className="hero-character__bob">
                  <svg viewBox="0 0 120 180" width="140" height="210" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="60" cy="168" rx="44" ry="11" fill="rgba(30,41,59,0.1)" />
                    <g className="swing-l">
                      <rect x="40" y="118" width="16" height="44" rx="8" fill="#334155" />
                    </g>
                    <g className="swing-r">
                      <rect x="62" y="118" width="16" height="44" rx="8" fill="#1e293b" />
                    </g>
                    <rect
                      x="22"
                      y="52"
                      width="76"
                      height="82"
                      rx="30"
                      fill="#fef3c7"
                      stroke="#d97706"
                      strokeWidth="3"
                    />
                    <circle cx="46" cy="80" r="7" fill="#0f172a" />
                    <circle cx="76" cy="80" r="7" fill="#0f172a" />
                    <path
                      d="M48 108 Q60 118 72 108"
                      stroke="#0f172a"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <ellipse cx="60" cy="30" rx="22" ry="16" fill="#6366f1" />
                    <g className="wave-arm">
                      <path
                        d="M94 70 Q118 52 122 28"
                        stroke="#fde68a"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="hero-title__line hero-title__a">일정관리의 모든 것!</span>
              <span className="hero-title__line hero-title__b">할꺼지로?</span>
            </h1>
            <p className="hero-sub">캘린더로 할 일을 모아 두고, 하루를 가볍게 시작해 보세요.</p>
            <Link className="btn-hero" to="/login">
              시작하기
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
