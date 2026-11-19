import React from 'react';
import classNames from 'classnames/bind';

import {
  SOCIAL_LABEL,
  SOCIAL_MORE,
  SOCIAL_PRIMARY,
  SocialType,
} from 'components/common/modal/login/loginFlow';
import LoginButton from 'components/common/modal/login/LoginButton';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import GithubIcon from 'public/icon/github.svg';
import GoogleIcon from 'public/icon/google.svg';
import KakaoIcon from 'public/icon/kakao.svg';
import NaverIcon from 'public/icon/naver.svg';

import style from './LoginPanel.module.scss';

const cn = classNames.bind(style);

interface LoginMainProps {
  moreOpen: boolean;
  onSocial: (type: SocialType) => void;
  onEmail: () => void;
  onToggleMore: () => void;
  onJoin: () => void;
  emailButtonRef: React.RefObject<HTMLButtonElement>;
  moreFirstRef: React.RefObject<HTMLButtonElement>;
}

const renderLogo = (type: SocialType) => {
  switch (type) {
    case 'kakao':
      return <KakaoIcon width={20} height={20} aria-hidden />;
    case 'google':
      return <GoogleIcon width={20} height={20} aria-hidden />;
    case 'naver':
      return <NaverIcon width={20} height={19} aria-hidden />;
    default:
      return <GithubIcon width={20} height={20} aria-hidden />;
  }
};

function LoginMain({
  moreOpen,
  onSocial,
  onEmail,
  onToggleMore,
  onJoin,
  emailButtonRef,
  moreFirstRef,
}: LoginMainProps) {
  return (
    <div className={cn('main')}>
      <h2 className={cn('title')}>로그인 · 회원가입</h2>
      <p className={cn('hint')}>
        처음이어도 간편 로그인 한 번이면 가입까지 끝나요.
      </p>
      <LoginButton
        variant={SOCIAL_PRIMARY}
        className={cn('first')}
        onClick={() => onSocial(SOCIAL_PRIMARY)}
      >
        {renderLogo(SOCIAL_PRIMARY)}
        <span>{SOCIAL_LABEL[SOCIAL_PRIMARY]}</span>
      </LoginButton>
      <LoginButton variant="email" ref={emailButtonRef} onClick={onEmail}>
        <TimelineIcon name="user" size={20} />
        <span>아이디로 로그인</span>
      </LoginButton>
      <LoginButton
        variant="more"
        aria-expanded={moreOpen}
        aria-controls="login-more"
        onClick={onToggleMore}
      >
        <span>다른 방법으로 로그인</span>
        <TimelineIcon name="chevron" size={16} className={cn('chev')} />
      </LoginButton>
      <div id="login-more" className={cn('more')} hidden={!moreOpen}>
        {SOCIAL_MORE.map((type, index) => (
          <LoginButton
            key={type}
            variant={type}
            className={index === 0 ? cn('moreFirst') : undefined}
            ref={index === 0 ? moreFirstRef : undefined}
            onClick={() => onSocial(type)}
          >
            {renderLogo(type)}
            <span>{SOCIAL_LABEL[type]}</span>
          </LoginButton>
        ))}
      </div>
      <p className={cn('foot')}>
        아이디 계정이 필요하면{' '}
        <button type="button" className={cn('link')} onClick={onJoin}>
          아이디로 가입
        </button>
      </p>
    </div>
  );
}

export default LoginMain;
