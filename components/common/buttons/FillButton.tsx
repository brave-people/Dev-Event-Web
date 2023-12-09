import style from 'components/common/buttons/FillButton.module.scss';
import getIconByName from 'lib/utils/iconUtil';
import { ButtonProps } from 'types/Button';
import React from 'react';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

type FillButtonProps = ButtonProps & {
  color: string;
  icon?: string;
  iconStyle?: string;
  rounded: boolean;
};

function FillButton({
  onClick,
  label,
  color,
  icon,
  iconStyle,
  rounded,
}: FillButtonProps) {
  return (
    <button className={cx('button', `color--${color}`, 'default', `${rounded && 'type--rounded'}`)} onClick={onClick}>
      {icon && getIconByName(icon, iconStyle, '#ffffff')}
      {label}
    </button>
  );
}

export default FillButton;
