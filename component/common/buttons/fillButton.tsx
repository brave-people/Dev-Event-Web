import classNames from 'classnames/bind';
import React from 'react';
import style from './fillButton.module.scss';
import Link from 'next/link';
const cx = classNames.bind(style);

function FillButton({ onClick, size = 'regular', label, color }: any) {
  return (
    <button className={cx('button', `size--${size}`, color)} onClick={onClick}>
      {label}
    </button>
  );
}

export default FillButton;
