import classNames from 'classnames/bind';
import React from 'react';
import style from './FillButton.module.scss';

const cx = classNames.bind(style);

function FillButton({ onClick, size = 'regular', label, color }: any) {
  return (
    <button className={cx('button', `size--${size}`, color)} onClick={onClick}>
      {label}
    </button>
  );
}

export default FillButton;
