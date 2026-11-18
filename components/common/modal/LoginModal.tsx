import { useEffect } from 'react';
import classNames from 'classnames/bind';
import Modal from 'react-modal';

import LoginBand from 'components/common/modal/login/LoginBand';
import LoginPanel from 'components/common/modal/login/LoginPanel';
import TimelineIcon from 'components/events/timeline/TimelineIcon';

import style from './LoginModal.module.scss';

const cx = classNames.bind(style);

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoginModal({ isOpen, onClose }: LoginModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={cx('card')}
      overlayClassName={cx('overlay')}
      contentLabel="로그인 · 회원가입"
    >
      <LoginBand />
      <button
        type="button"
        className={cx('close')}
        aria-label="로그인 창 닫기"
        onClick={onClose}
      >
        <TimelineIcon name="x" size={20} />
      </button>
      <div className={cx('body')}>
        <LoginPanel onClose={onClose} />
      </div>
    </Modal>
  );
}

export default LoginModal;
