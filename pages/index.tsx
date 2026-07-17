import { serialize } from 'cookie';
import jwt_decode from 'jwt-decode';
import { MdOutlineEmail } from 'react-icons/md';
import {
  SiAndroid,
  SiApple,
  SiGithub,
  SiInstagram,
  SiThreads,
} from 'react-icons/si';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import HeroStarfield from 'components/brand/HeroStarfield';
import styles from 'styles/Brand.module.scss';

const GITHUB_URL = 'https://github.com/brave-people/Dev-Event';

const COMPANION_SERVICES = [
  {
    name: 'Android 앱',
    href: 'https://play.google.com/store/apps/details?id=com.bravepeople.devevent.android.app',
    description:
      'Google Play에서 데브이벤트 앱으로 새로운 개발자 행사를 빠르게 확인하세요.',
    icon: 'android',
    className: styles.serviceAndroid,
  },
  {
    name: 'iOS 앱',
    href: 'https://apps.apple.com/kr/app/%EB%8D%B0%EB%B8%8C%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EA%B0%9C%EB%B0%9C%EC%9E%90-%ED%96%89%EC%82%AC-%EC%A0%95%EB%B3%B4/id6502765233',
    description:
      'App Store에서 데브이벤트를 설치하고 관심 있는 행사 소식을 놓치지 마세요.',
    icon: 'ios',
    className: styles.serviceApple,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/dev.event.official/',
    description:
      '행사 소식과 큐레이션 콘텐츠를 인스타그램에서 가볍게 만나보세요.',
    icon: 'instagram',
    className: styles.serviceInstagram,
  },
  {
    name: 'Threads',
    href: 'https://www.threads.com/@dev.event.official?hl=ko',
    description:
      '데브이벤트의 짧은 소식과 이야기를 Threads에서 편하게 이어서 만나보세요.',
    icon: 'threads',
    className: styles.serviceThreads,
  },
  {
    name: 'Email 구독',
    href: 'https://github.com/brave-people/Dev-Event-Subscribe',
    description: '새로운 개발자 행사 정보를 정리된 이메일로 받아보세요.',
    icon: 'mail',
    className: styles.serviceEmail,
  },
  {
    name: '웨일 확장앱',
    href: 'https://store.whale.naver.com/detail/dfhagfnmecmkhdoeggeokfmmkbpiahek',
    description:
      '웨일 브라우저에 데브이벤트를 추가하고 새로운 행사 소식을 더 빠르게 확인하세요.',
    icon: 'whale',
    className: styles.serviceWhale,
  },
] as const;

type ServiceIconProps = {
  type: typeof COMPANION_SERVICES[number]['icon'];
};

function ServiceIcon({ type }: ServiceIconProps) {
  if (type === 'android') {
    return <SiAndroid aria-hidden="true" />;
  }

  if (type === 'ios') {
    return <SiApple aria-hidden="true" />;
  }

  if (type === 'instagram') {
    return <SiInstagram aria-hidden="true" />;
  }

  if (type === 'threads') {
    return <SiThreads aria-hidden="true" />;
  }

  if (type === 'whale') {
    return (
      <Image
        src="/icon/whale.png"
        alt=""
        width={29}
        height={29}
        aria-hidden="true"
      />
    );
  }

  return <MdOutlineEmail aria-hidden="true" />;
}

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

        <section className={styles.services} aria-labelledby="services-title">
          <div className={styles.servicesInner}>
            <h2 id="services-title">데브이벤트를 더 가까이</h2>
            <p>
              앱과 소셜 미디어, 이메일에서도 새로운 개발자 행사 소식을
              만나보세요.
            </p>
            <div className={styles.serviceGrid}>
              {COMPANION_SERVICES.map((service) => (
                <a
                  key={service.name}
                  className={`${styles.serviceCard} ${service.className}`}
                  href={service.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${service.name} 바로가기`}
                >
                  <div className={styles.serviceHeader}>
                    <span className={styles.serviceIcon}>
                      <ServiceIcon type={service.icon} />
                    </span>
                    <h3>{service.name}</h3>
                  </div>
                  <p>{service.description}</p>
                  <span className={styles.serviceArrow} aria-hidden="true">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerContent}>
            <span className={styles.footerWordmark}>DEV EVENT</span>
            <p className={styles.footerDescription}>
              개발자를 위한 행사 정보, 데브이벤트
            </p>
            <p className={styles.footerCopyright}>
              ⓒ 2022.{' '}
              <a
                href="https://github.com/brave-people/dev-Event"
                target="_blank"
                rel="noreferrer"
              >
                용감한 친구들 with 남송리 삼번지
              </a>{' '}
              all rights reserved.
            </p>
          </div>

          <nav className={styles.footerLinks} aria-label="관련 서비스 바로가기">
            <a
              className={styles.footerIconLink}
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Dev Event GitHub 저장소"
            >
              <SiGithub aria-hidden="true" />
            </a>
            <a
              className={styles.footerIconLink}
              href="https://store.whale.naver.com/detail/dfhagfnmecmkhdoeggeokfmmkbpiahek"
              target="_blank"
              rel="noreferrer"
              aria-label="Dev Event 웨일 확장앱"
            >
              <Image
                src="/icon/whale.png"
                alt=""
                width={30}
                height={30}
                aria-hidden="true"
              />
            </a>
          </nav>
        </div>
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
