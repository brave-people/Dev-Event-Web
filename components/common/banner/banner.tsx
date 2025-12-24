import classNames from 'classnames/bind';
import React, { useContext } from 'react';
import style from 'components/common/banner/banner.module.scss';
import { WindowContext } from 'context/window';

const cn = classNames.bind(style);

function Banner() {
  const { isNotice } = useContext(WindowContext);
  return (
    <div className={cn('banner', isNotice ? 'notice--true' : 'notice--false')}>
      <h1 className={cn('banner__title')}>
        개발자 행사는
        <br /> 모두 Dev Event 웹에서
      </h1>
      <h3 className={cn('banner__desc')}>
        진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!{' '}
      </h3>
      <video
        className={cn('banner__video')}
        src="/default/dev_event_banner_wave.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-label="banner"
      />
    </div>
  );
}

export default Banner;
