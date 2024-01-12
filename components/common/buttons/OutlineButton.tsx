import classNames from 'classnames/bind';
import React from 'react';
import style from 'components/common/buttons/OutlineButton.module.scss';

const cx = classNames.bind(style);

type OutlineButtonProps = {
  onClick: () => void;
  label: string;
  size: string;
  color?: string;
};

function OutlineButton({
  onClick,
  size = 'regular',
  label,
  color,
}: OutlineButtonProps) {
  return (
    <button className={cx('button', `size--${size}`, color)} onClick={onClick}>
      {label}
    </button>
  );
}

export default OutlineButton;
