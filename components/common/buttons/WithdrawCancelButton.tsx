import style from 'components/common/buttons/WithdrawCancelButton.module.scss';
import React from 'react';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

export interface WithdrawCancelButtonProps {
  onRequestClose?: () => void;
}

const WithdrawCancelButton = ({ onRequestClose }: WithdrawCancelButtonProps) => {
  return (
    <button className={cx('withdraw_cancel')} onClick={onRequestClose}>
      취소하기
    </button>
  );
};

export default WithdrawCancelButton;
