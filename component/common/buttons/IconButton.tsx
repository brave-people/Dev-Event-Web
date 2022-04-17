import classNames from 'classnames/bind';
import React from 'react';
import style from './iconButton.module.scss';
import Link from 'next/link';
const cx = classNames.bind(style);

function IconButton({ onClick, size = 'regular', icon }: any) {
  return (
    <button className={cx('button', `size--${size}`)} onClick={onClick}>
      {icon}
    </button>
  );
}

export default IconButton;
