import classNames from 'classnames/bind';
import React from 'react';
import style from 'components/common/buttons/TextButton.module.scss';
import { ButtonProps } from 'types/Button';

const cx = classNames.bind(style);

function TextButton({ onClick, label, size = 'regular' }: ButtonProps) {
  return (
    <button className={cx(`button`, `size--${size}`)} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
}

export default TextButton;
