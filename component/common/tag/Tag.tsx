import classNames from 'classnames/bind';
import React from 'react';
import style from './tag.module.scss';
const cx = classNames.bind(style);

function Tag({ onClick, label, size = 'regular' }: any) {
  return (
    <button className={cx('tag', `size--${size}`)} onClick={onClick}>
      # {label}
    </button>
  );
}

export default Tag;
