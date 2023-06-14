import classNames from 'classnames/bind';
import React from 'react';
import style from './TextButton.module.scss';
const cx = classNames.bind(style);

function TextButton({ onClick, label, size = 'regular' }: any) {
  return (
    <button className={cx(`button`, `size--${size}`)} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
}

export default TextButton;
