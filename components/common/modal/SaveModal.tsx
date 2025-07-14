import classNames from 'classnames/bind';
import { SaveIcon } from 'components/icons';
import { WindowContext } from 'context/window';
import React, { useContext } from 'react';
import style from 'components/common/modal/ShareModal.module.scss';

const cn = classNames.bind(style);

interface SaveModalProps {
  isVisible: boolean;
  message: string;
}

function SaveModal({ isVisible, message }: SaveModalProps) {
  const { windowTheme } = useContext(WindowContext);

  if (!isVisible) return null;

  return (
    <div className={cn('modal', windowTheme ? 'light--modal' : 'dark--modal')}>
      <SaveIcon />
      <span className={cn('modal__text')}>{message}</span>
    </div>
  );
}

export default SaveModal;
