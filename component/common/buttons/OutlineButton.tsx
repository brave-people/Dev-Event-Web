import classNames from 'classnames/bind';
import React from 'react';
import style from './OutlineButton.module.scss';
const cx = classNames.bind(style);

function OutlineButton({ onClick, size = 'regular', label, color }: any) {
  return (
    <button className={cx('button', `size--${size}`, color)} onClick={onClick}>
      {label}
    </button>
  );
}

export default OutlineButton;
