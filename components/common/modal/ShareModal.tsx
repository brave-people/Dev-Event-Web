import classNames from 'classnames/bind';
import React from 'react';
import style from './ShareModal.module.scss';

const cn = classNames.bind(style);

function ShareModal() {
  return (
    <div className={cn('modal')}>
      행사 링크가 복사되었습니다 ✅
    </div>
  );
}

export default ShareModal;
