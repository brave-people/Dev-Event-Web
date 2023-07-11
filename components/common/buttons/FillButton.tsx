import classNames from 'classnames/bind';
import React, { MouseEventHandler } from 'react';
import style from './FillButton.module.scss';
import getIconByName from 'lib/utils/iconUtil';

const cx = classNames.bind(style);

type FillButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
  color: string;
  size?: string;
  icon?: string;
  iconStyle?: string;
}

function FillButton({ onClick, size = 'regular', label, color, icon, iconStyle }: FillButtonProps) {
  return (
    <button className={cx('button', `size--${size}`, color, 'default')} onClick={onClick}>
      {getIconByName('plus', iconStyle, '#ffffff')}
      {label}
    </button>
  );
}

export default FillButton;
