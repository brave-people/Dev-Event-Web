import classNames from 'classnames/bind';
import React from 'react';
import style from 'components/common/buttons/OutlineButton.module.scss'
import { ButtonProps } from 'types/Button';

const cx = classNames.bind(style);

type OutlineButtonProps = ButtonProps & {
  color: string;
}

function OutlineButton({ onClick, size = 'regular', label, color }: OutlineButtonProps) {
  return (
    <button className={cx('button', `size--${size}`, color)} onClick={onClick}>
      {label}
    </button>
  );
}

export default OutlineButton;
