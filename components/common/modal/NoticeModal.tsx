import style from 'components/common/modal/NoticeModal.module.scss';
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
    document.documentElement.setAttribute('data-notice', 'off');
    Cookie.set(DEV_EVENT_NOTICE, 'true', { expires: 90 });
  };

  useEffect(() => {
    if (Cookie.get(DEV_EVENT_NOTICE) === 'true') {
      handleIsNotice(false);
      document.documentElement.setAttribute('data-notice', 'off');
    }
  }, []);

  return (
    <div className={cn('notice', !isNotice && 'status--delete')} role="note">
      <div className={cn('notice__inner')}>
        <div className={cn('notice__content')}>
          <span className={cn('notice__title')}>
            개발자를 위한 행사 정보, 데브이벤트
          </span>
        </div>
        <button
          type="button"
          className={cn('icon')}
          aria-label="공지 닫기"
          onClick={hideModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="m7 7 10 10m0-10L7 17"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default NoticeModal;
