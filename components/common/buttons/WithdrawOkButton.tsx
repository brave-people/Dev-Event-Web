import style from 'components/common/buttons/WithdrawOkButton.module.scss';
import React from 'react';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const WithdrawOkButton = () => {
  return <button className={cx('withdraw')}>탈퇴하기</button>;
};

export default WithdrawOkButton;
