import classNames from 'classnames/bind';
import React, { useEffect } from 'react';
import style from './FilterTag.module.scss';
const cx = classNames.bind(style);

function FilterTag({ onClick, label, size = 'regular', color = '#5d93e4' }: any) {
  return (
    <button className={cx('tag', `size--${size}`)} onClick={onClick} style={{ backgroundColor: color }}>
      # {label}
    </button>
  );
}

export default FilterTag;
