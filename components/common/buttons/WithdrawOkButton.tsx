import style from 'components/common/buttons/WithdrawOkButton.module.scss';
import React from 'react';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

export interface WithdrawOkButtonProps {
  onClick?: () => void;
}

const WithdrawOkButton = ({ onClick }: WithdrawOkButtonProps) => {
  return (
    <button className={cx('withdraw')} onClick={onClick}>
      탈퇴하기
    </button>
  );
};

export default WithdrawOkButton;
