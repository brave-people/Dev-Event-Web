import classNames from 'classnames/bind';
import React from 'react';
import style from './FilterTag.module.scss';

const cx = classNames.bind(style);

type Tag = {
  label: string | undefined;
  size: string;
  type: string;
}

function FilterTag({ label, size = 'regular', type }: Tag) {
  if (label === undefined)
    return <></>;
  return (
    <button 
      className={cx('tag', `size--${size}`, `type--${type}`)}>
      {label}
    </button>
  );
}

export default FilterTag;
