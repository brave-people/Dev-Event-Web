import style from 'components/common/modal/NoticeModal.module.scss';
import { DeleteIcon, CalenderLogo } from 'components/icons';
import { WindowContext } from 'context/window';
import Cookie from 'js-cookie';
import React, { useContext, useEffect } from 'react';
import classNames from 'classnames/bind';

const DEV_EVENT_NOTICE = 'dev-event-notice';

const cn = classNames.bind(style);

function NoticeModal() {
  const { isNotice, handleIsNotice } = useContext(WindowContext);

  const hideModal = () => {
    handleIsNotice(false);
    Cookie.set(DEV_EVENT_NOTICE, 'true', { expires: 90 });
  };

  useEffect(() => {
    if (Cookie.get(DEV_EVENT_NOTICE) === 'true') {
      handleIsNotice(false);
    }
  }, []);

  // 배너를 닫으면 fixed Header 가 48px 줄어드는데, 페이지 상단 여백이 그걸 따라가야 한다.
  // 초기값은 _document.tsx 의 인라인 스크립트가 이미 잡아둔다.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--notice-h',
      isNotice ? '48px' : '0px'
    );
  }, [isNotice]);

  return (
    <div
      className={cn('notice', !isNotice && 'status--delete', 'notice--light')}
    >
      <div className={cn('notice__inner')}>
        <div className={cn('notice__content')}>
          <span className={cn('notice__title')}>
            개발자를 위한 행사 정보, 데브이벤트
          </span>
          <CalenderLogo />
        </div>
        <div className={cn('icon')} onClick={hideModal}>
          <DeleteIcon color={'rgb(43, 45, 54)'} />
        </div>
      </div>
    </div>
  );
}

export default NoticeModal;
