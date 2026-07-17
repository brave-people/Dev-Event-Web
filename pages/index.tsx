import { serialize } from 'cookie';
import jwt_decode from 'jwt-decode';
import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import HeroStarfield from 'components/brand/HeroStarfield';
import styles from 'styles/Brand.module.scss';

const GITHUB_URL = 'https://github.com/brave-people/Dev-Event';
const SUBMIT_URL = 'https://forms.gle/UUjUVg1tTrKhemKu9';

type FeatureIconProps = {
  type: 'bolt' | 'globe' | 'heart';
};

function FeatureIcon({ type }: FeatureIconProps) {
  if (type === 'bolt') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18.2 2 6 18h9l-1.2 12L26 13h-9l1.2-11Z" />
      </svg>
    );
  }

  if (type === 'globe') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" />
        <path d="M3 16h26M16 3c4 4 6 8.3 6 13s-2 9-6 13c-4-4-6-8.3-6-13s2-9 6-13Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 28S4 21.2 4 12.7C4 7.4 10.3 4.8 16 10c5.7-5.2 12-2.6 12 2.7C28 21.2 16 28 16 28Z" />
    </svg>
  );
}

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Head>
        <title>Dev Event | 개발자 행사를 한눈에</title>
        <meta
          name="description"
          content="개발자 컨퍼런스, 밋업, 해커톤과 네트워킹 일정을 가장 먼저 만나보세요."
        />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/">
            <a className={styles.wordmark} aria-label="Dev Event 홈">
              DEV EVENT
            </a>
          </Link>

          <nav
            className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
            aria-label="브랜드 페이지 주요 메뉴"
          >
            <Link href="/events">
              <a onClick={() => setMenuOpen(false)}>행사</a>
            </Link>
            <a
              href={SUBMIT_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              행사 제보
            </a>
          </nav>

          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <HeroStarfield />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroContent}>
            <h1 id="hero-title">
              <span>DEV</span> <span>EVENT</span>
            </h1>
            <p className={styles.heroDescription}>
              개발자 컨퍼런스와 밋업, 해커톤의 모든 일정,
              <br />
              놓치지 않고 가장 먼저 알려드립니다.
            </p>
            <div className={styles.heroActions}>
              <Link href="/events">
                <a className={styles.primaryAction}>행사 둘러보기</a>
              </Link>
              <a
                className={styles.textAction}
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
              >
                GitHub 저장소 보기 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <a className={styles.scrollHint} href="#about">
            더 알아보기
            <span aria-hidden="true">↓</span>
          </a>
        </section>

        <section
          id="about"
          className={styles.about}
          aria-labelledby="about-title"
        >
          <div className={styles.aboutInner}>
            <h2 id="about-title">
              개발자를 위한
              <br className={styles.mobileBreak} /> 가치 있는 정보
            </h2>
            <p className={styles.sectionDescription}>
              전국의 개발자 컨퍼런스, 밋업, 해커톤 등 기술 이벤트를 큐레이션하여
              <br className={styles.desktopBreak} /> 개발자들이 더 성장할 수
              있도록 돕습니다.
            </p>

            <div className={styles.features}>
              <article className={`${styles.feature} ${styles.featureGreen}`}>
                <div className={styles.featureIcon}>
                  <FeatureIcon type="bolt" />
                </div>
                <div>
                  <h3>빠르고 정확하게</h3>
                  <p>
                    새로운 행사를 빠르게 수집하고
                    <br /> 검증하여 정확한 정보를 제공합니다.
                  </p>
                </div>
              </article>
              <article className={`${styles.feature} ${styles.featureBlue}`}>
                <div className={styles.featureIcon}>
                  <FeatureIcon type="globe" />
                </div>
                <div>
                  <h3>다양한 이벤트</h3>
                  <p>
                    컨퍼런스, 밋업, 해커톤 등
                    <br /> 다양한 기술 이벤트를 다룹니다.
                  </p>
                </div>
              </article>
              <article className={`${styles.feature} ${styles.featurePink}`}>
                <div className={styles.featureIcon}>
                  <FeatureIcon type="heart" />
                </div>
                <div>
                  <h3>개발자 커뮤니티</h3>
                  <p>
                    개발자들이 정보를 공유하고
                    <br /> 함께 성장할 수 있는 연결을 지향합니다.
                  </p>
                </div>
              </article>
            </div>

            <div className={styles.bottomCta}>
              <div>
                <p>다음 성장의 기회를 찾고 있나요?</p>
                <h2>오늘 열리는 개발자 행사를 만나보세요.</h2>
              </div>
              <Link href="/events">
                <a>
                  전체 행사 보기 <span aria-hidden="true">→</span>
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>DEV EVENT</span>
        <p>개발자를 위한 행사 정보, 데브이벤트</p>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.accessToken && context.query.refreshToken) {
    const { exp: access_token_expired_at } = jwt_decode(
      String(context.query.accessToken)
    ) as { exp: number };
    const { exp: refresh_token_expired_at } = jwt_decode(
      String(context.query.refreshToken)
    ) as { exp: number };

    context.res.setHeader('Set-Cookie', [
      serialize('access_token', String(context.query.accessToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires: new Date(access_token_expired_at * 1000),
        path: '/',
      }),
      serialize('refresh_token', String(context.query.refreshToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires: new Date(refresh_token_expired_at * 1000),
        path: '/',
      }),
    ]);

    return {
      redirect: {
        destination: '/events',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default Home;
