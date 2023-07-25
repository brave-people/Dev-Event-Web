import React from 'react';
import classNames from 'classnames/bind';
import style from './FillButton.module.scss';
import getIconByName from 'lib/utils/iconUtil';
import { DefaultButton } from 'types/Button';

const cx = classNames.bind(style);

type FillButtonProps = DefaultButton & {
  color: string;
  icon?: string;
  iconStyle?: string;
  rounded: boolean;
}

function FillButton({ onClick, size, label, color, icon, iconStyle, rounded }: FillButtonProps) {
  return (
    <button className={cx('button', `size--${size}`, `color--${color}`,'default', `${rounded && "type--rounded"}`)} onClick={onClick}>
      {icon && getIconByName(icon, iconStyle, '#ffffff')}
      {label}
    </button>
  );
}

export default FillButton;
