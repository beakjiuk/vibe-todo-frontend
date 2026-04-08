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
            <div className="hero-mascot-wrap" aria-hidden>
              <img className="hero-mascot" src="/background.gif" alt="" loading="lazy" />
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
