import { Link } from 'react-router-dom';
import { useBodyClass } from '../hooks/useBodyClass';

export function LandingPage() {
  useBodyClass('landing-body');

  return (
    <>
      <main
        id="mainLanding"
        className="main-landing is-active"
        aria-live="polite"
      >
        <div className="hero">
          <div className="hero-visual">
            <div className="hero-deco" aria-hidden />
            <div className="hero-card-ui" aria-hidden>
              <div className="hero-card-ui__top">
                <span className="hero-card-ui__badge">TODAY</span>
                <span className="hero-card-ui__chip">3 tasks</span>
              </div>
              <div className="hero-card-ui__list">
                <div className="hero-card-ui__row">
                  <span className="hero-card-ui__box" />
                  <span className="hero-card-ui__line hero-card-ui__line--w1" />
                </div>
                <div className="hero-card-ui__row hero-card-ui__row--done">
                  <span className="hero-card-ui__box hero-card-ui__box--done" />
                  <span className="hero-card-ui__line hero-card-ui__line--w2" />
                </div>
                <div className="hero-card-ui__row">
                  <span className="hero-card-ui__box" />
                  <span className="hero-card-ui__line hero-card-ui__line--w3" />
                </div>
              </div>
              <div className="hero-card-ui__progress">
                <span className="hero-card-ui__progress-bar" />
              </div>
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
