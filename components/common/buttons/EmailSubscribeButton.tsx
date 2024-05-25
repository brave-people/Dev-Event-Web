import style from 'components/common/buttons/EmailSubscribeButton.module.scss';
import React from 'react';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const EmailSubscribeButton = () => {
  return <button className={cx('email_subscribe')}>무료 구독하기</button>;
};

export default EmailSubscribeButton;
