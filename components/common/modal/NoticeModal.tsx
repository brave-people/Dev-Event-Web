import style from 'components/common/modal/NoticeModal.module.scss';
import { DeleteIcon } from 'components/icons';
import { WindowContext } from 'context/window';
import Cookie from 'js-cookie';
import { useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';

const DEV_EVENT_NOTICE = 'dev-event-notice';

const cn = classNames.bind(style);

function NoticeModal() {
  const { isNotice, windowTheme, handleIsNotice } = useContext(WindowContext);

  const hideModal = () => {
    handleIsNotice(false);
    Cookie.set(DEV_EVENT_NOTICE, 'true', { expires: 90 });
  };

  useEffect(() => {
    if (Cookie.get(DEV_EVENT_NOTICE) === 'true') {
      handleIsNotice(false);
    }
  }, []);

  return (
    <div
      className={cn(
        'notice',
        !isNotice && 'status--delete',
        windowTheme ? 'notice--light' : 'notice--dark'
      )}
    >
      <div className={cn('notice__inner')}>
        <div className={cn('notice__content')}>
          <span className={cn('notice__title')}>
            개발자를 위한 행사 정보, 데브이벤트
          </span>
          <Image src={'/icon/notice.png'} width={36} height={36} />
        </div>
        <div className={cn('icon')} onClick={hideModal}>
          <DeleteIcon color={'rgba(49, 50, 52, 1)'} />
        </div>
      </div>
    </div>
  );
}

export default NoticeModal;
