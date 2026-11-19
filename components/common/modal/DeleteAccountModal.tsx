import { useEffect } from 'react';

import classNames from 'classnames/bind';
import Modal from 'react-modal';

import style from 'components/common/modal/DeleteAccountModal.module.scss';

const cx = classNames.bind(style);

export interface DeleteAccountModalProps {
  isOpen?: boolean;
  onClick?: () => void;
  onCancel?: () => void;
}

function DeleteAccountModal({
  isOpen,
  onClick,
  onCancel,
}: DeleteAccountModalProps) {
  const open = isOpen === true;

  // 열려 있는 동안 뒤 화면이 스크롤되지 않게 한다
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <Modal
      isOpen={open}
      className={cx('card')}
      overlayClassName={cx('overlay')}
      onRequestClose={onCancel}
      role="alertdialog"
      contentLabel="회원 탈퇴 확인"
      aria={{ describedby: 'delete-account-desc' }}
    >
      <strong className={cx('title')}>정말 탈퇴하시겠습니까?</strong>
      <p id="delete-account-desc" className={cx('desc')}>
        탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.
        <br />
        삭제된 정보는 다시 복구할 수 없습니다.
      </p>
      <div className={cx('buttons')}>
        <button type="button" className={cx('button')} onClick={onCancel}>
          취소
        </button>
        <button type="button" className={cx('button', 'ok')} onClick={onClick}>
          탈퇴하기
        </button>
      </div>
    </Modal>
  );
}

export default DeleteAccountModal;
