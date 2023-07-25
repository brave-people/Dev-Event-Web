import classNames from 'classnames/bind';
import React from 'react';
import style from './TextButton.module.scss';
import { DefaultButton } from 'types/Button';
const cx = classNames.bind(style);

function TextButton({ onClick, label, size = 'regular' }: DefaultButton) {
  return (
    <button className={cx(`button`, `size--${size}`)} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
}

export default TextButton;
