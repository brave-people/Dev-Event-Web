import classNames from 'classnames/bind';
import React, { useContext } from 'react';
import style from 'components/common/modal/ShareModal.module.scss';
import { CheckIcon } from 'components/icons';
import { WindowContext } from 'context/window';

const cn = classNames.bind(style);

function ShareModal() {
  const { windowTheme } = useContext(WindowContext);
  return (
    <div className={cn('modal', windowTheme ? 'light--modal' : 'dark--modal')}>
      <CheckIcon />
      <span className={cn('modal__text')}>링크가 복사되었습니다</span>
    </div>
  );
}

export default ShareModal;
