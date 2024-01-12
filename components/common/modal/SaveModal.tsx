import classNames from 'classnames/bind';
import React, { useContext } from 'react';
import style from 'components/common/modal/ShareModal.module.scss';
import { SaveIcon } from 'components/icons';
import { WindowContext } from 'context/window';

const cn = classNames.bind(style);

function SaveModal() {
  const { windowTheme } = useContext(WindowContext);
  return (
    <div className={cn('modal', windowTheme ? 'light--modal' : 'dark--modal')}>
      <SaveIcon />
      <span className={cn('modal__text')}>저장되었습니다</span>
    </div>
  );
}

export default SaveModal;
